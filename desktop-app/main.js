const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const APP_VERSION = "1.0.1";

const PRODUCTION_URL = "https://www.nextups.xyz";
const LOCAL_URL = "http://localhost:3000";


let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Custom Window UI (Frameless, non-WebView2)
    backgroundColor: "#ffffff",
    title: "NextUps - 멀티플랫폼 게임 업데이트 통합 플랫폼",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setUserAgent(mainWindow.webContents.getUserAgent() + " NextUpsDesktopApp/1.0.0 (Windows)");

  // Inject custom titlebar and auto update banner styles & DOM
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.insertCSS(`
      #nextups-custom-titlebar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 38px;
        background: #0f172a;
        color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        user-select: none;
        -webkit-app-region: drag;
        border-bottom: 1px solid #1e293b;
      }
      #nextups-custom-titlebar .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
      }
      #nextups-custom-titlebar .brand-badge {
        background: #2563eb;
        color: #ffffff;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
      #nextups-custom-titlebar .window-controls {
        display: flex;
        align-items: center;
        -webkit-app-region: no-drag;
      }
      #nextups-custom-titlebar .win-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s ease;
      }
      #nextups-custom-titlebar .win-btn:hover {
        background: #1e293b;
        color: #ffffff;
      }
      #nextups-custom-titlebar .win-btn.close:hover {
        background: #ef4444;
        color: #ffffff;
      }
      body {
        padding-top: 38px !important;
      }
    `);

    mainWindow.webContents.executeJavaScript(`
      if (!document.getElementById("nextups-custom-titlebar")) {
        const bar = document.createElement("div");
        bar.id = "nextups-custom-titlebar";
        bar.innerHTML = \`
          <div class="brand">
            <span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:#2563eb;color:#fff;text-align:center;line-height:18px;font-size:11px;font-weight:900;">N</span>
            <span>NextUps</span>
            <span style="color:#64748b;font-weight:400;margin:0 4px;">|</span>
            <span style="color:#94a3b8;font-size:11px;font-weight:500;">게임 업데이트 통합 플랫폼</span>
            <span class="brand-badge">Chromium v\${window.nextupsDesktop ? window.nextupsDesktop.version : "1.0.0"}</span>
          </div>
          <div class="window-controls">
            <button class="win-btn" title="새로고침 (F5)" onclick="window.nextupsDesktop.reload()">↻</button>
            <button class="win-btn" title="최소화" onclick="window.nextupsDesktop.minimize()">─</button>
            <button class="win-btn" title="최대화 / 복원" onclick="window.nextupsDesktop.maximize()">□</button>
            <button class="win-btn close" title="닫기" onclick="window.nextupsDesktop.close()">✕</button>
          </div>
        \`;
        document.body.prepend(bar);
      }
    `);
  });

  // Try production first, fallback to localhost if offline/developing
  mainWindow.loadURL(PRODUCTION_URL).catch(() => {
    mainWindow.loadURL(LOCAL_URL);
  });

  // Check for updates after window loads
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    setTimeout(checkForUpdates, 2000);
  });
}

function checkForUpdates() {
  const checkUrl = `${PRODUCTION_URL}/api/app/update?platform=windows&version=${APP_VERSION}&test=true`;
  
  const handleResponse = (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.hasUpdate) {
          dialog
            .showMessageBox(mainWindow, {
              type: "info",
              title: "🚀 NextUps 새 버전 업데이트 안내",
              message: `새로운 버전 v${json.latestVersion}이 준비되었습니다!`,
              detail: `현재 버전: v${APP_VERSION}\n최신 버전: v${json.latestVersion}\n\n[주요 변경사항]\n${json.changelog.map((c) => "• " + c).join("\n")}`,
              buttons: ["지금 업데이트 다운로드", "나중에 알림"],
              defaultId: 0,
              cancelId: 1,
            })
            .then(({ response }) => {
              if (response === 0 && json.downloadUrl) {
                startInAppUpdateDownload(json.downloadUrl, json.latestVersion);
              }
            });
        }
      } catch (err) {
        console.error("Update JSON parse error:", err);
      }
    });
  };


  const req = https.get(checkUrl, handleResponse);
  req.on("error", () => {
    const fallbackReq = http.get(
      `${LOCAL_URL}/api/app/update?platform=windows&version=${APP_VERSION}&test=true`,
      handleResponse
    );
    fallbackReq.on("error", () => {});
  });
}

function startInAppUpdateDownload(downloadUrl, latestVersion) {
  if (!mainWindow) return;

  // Insert real-time progress banner directly into webContents
  mainWindow.webContents.executeJavaScript(`
    let b = document.getElementById("nextups-inapp-update-bar");
    if (!b) {
      b = document.createElement("div");
      b.id = "nextups-inapp-update-bar";
      b.style.cssText = "position:fixed;top:38px;left:0;right:0;z-index:99999;background:#1d4ed8;color:#fff;padding:12px 18px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;flex-direction:column;gap:8px;";
      b.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:12px;font-weight:bold;">🚀 NextUps v\${${JSON.stringify(latestVersion)}} 업데이트 다운로드 중...</div>
          <div id="nextups-update-percent-text" style="font-size:12px;font-weight:800;color:#93c5fd;">0%</div>
        </div>
        <div style="background:rgba(255,255,255,0.2);height:8px;border-radius:4px;overflow:hidden;position:relative;">
          <div id="nextups-update-progress-fill" style="background:#38bdf8;height:100%;width:0%;transition:width 0.2s ease;"></div>
        </div>
        <div id="nextups-update-status-detail" style="font-size:11px;color:#dbeafe;">안전한 공식 CDN 서버에서 최신 설치 파일을 받아오는 중...</div>
      \`;
      document.body.appendChild(b);
    }
  `);

  const tempFilePath = path.join(os.tmpdir(), "NextUps-Setup-Latest.exe");
  const fileStream = fs.createWriteStream(tempFilePath);

  const fetchUrl = (targetUrl) => {
    const client = targetUrl.startsWith("https") ? https : http;
    client.get(targetUrl, (res) => {
      // Handle redirect (e.g., 302 to GitHub Releases)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location);
      }

      if (res.statusCode !== 200) {
        mainWindow.webContents.executeJavaScript(`
          const s = document.getElementById("nextups-update-status-detail");
          if (s) s.innerText = "다운로드 실패: HTTP " + ${res.statusCode};
        `);
        return;
      }

      const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
      let downloadedBytes = 0;
      const startTime = Date.now();

      res.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        fileStream.write(chunk);

        if (totalBytes > 0) {
          const percent = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
          const dlMB = (downloadedBytes / (1024 * 1024)).toFixed(1);
          const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
          const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
          const speedMB = (dlMB / elapsedSec).toFixed(1);

          mainWindow.webContents.executeJavaScript(`
            const fill = document.getElementById("nextups-update-progress-fill");
            const pt = document.getElementById("nextups-update-percent-text");
            const st = document.getElementById("nextups-update-status-detail");
            if (fill) fill.style.width = "${percent}%";
            if (pt) pt.innerText = "${percent}%";
            if (st) st.innerText = "다운로드 진행 중... ${dlMB}MB / ${totalMB}MB (${percent}%) • ${speedMB} MB/s";
          `).catch(() => {});
        }
      });

      res.on("end", () => {
        fileStream.end();
        mainWindow.webContents.executeJavaScript(`
          const fill = document.getElementById("nextups-update-progress-fill");
          const pt = document.getElementById("nextups-update-percent-text");
          const st = document.getElementById("nextups-update-status-detail");
          if (fill) fill.style.width = "100%";
          if (pt) pt.innerText = "100%";
          if (st) st.innerText = "다운로드 완료! 설치 프로그램을 실행합니다...";
        `).catch(() => {});

        setTimeout(() => {
          try {
            spawn(tempFilePath, [], { detached: true, stdio: "ignore" }).unref();
            app.quit();
          } catch (launchErr) {
            console.error("Installer launch error:", launchErr);
          }
        }, 800);
      });

      res.on("error", (err) => {
        console.error("Download stream error:", err);
      });
    }).on("error", (err) => {
      console.error("Download request error:", err);
    });
  };

  fetchUrl(downloadUrl);
}


// IPC Handlers for custom titlebar controls
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on("window-reload", () => {
  if (mainWindow) mainWindow.reload();
});

ipcMain.handle("check-update", async () => {
  checkForUpdates();
  return { status: "checking" };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
