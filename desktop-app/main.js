const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

const APP_VERSION = "1.0.2";
const LOGO_BASE64 = `data:image/png;base64,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`;

const PRODUCTION_URL = "https://www.nextups.xyz";
const LOCAL_URL = "http://localhost:3000";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Custom Window UI
    backgroundColor: "#ffffff",
    title: "NextUps - 멀티플랫폼 게임 업데이트 통합 플랫폼",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setUserAgent(
    mainWindow.webContents.getUserAgent() + ` NextUpsDesktopApp/${APP_VERSION} (Windows)`
  );

  // Inject refined dark header with rounded top edges, no neon, no Chromium text
  mainWindow.webContents.on("dom-ready", () => {
    mainWindow.webContents.insertCSS(`
      #nextups-custom-titlebar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 38px;
        background: #090d16;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
        user-select: none;
        -webkit-app-region: drag;
        border-bottom: 1px solid #1e293b;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      #nextups-custom-titlebar .brand-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #nextups-custom-titlebar .brand-logo {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        object-fit: cover;
      }
      #nextups-custom-titlebar .brand-title {
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.2px;
      }
      #nextups-custom-titlebar .brand-divider {
        color: #475569;
        font-size: 11px;
      }
      #nextups-custom-titlebar .brand-desc {
        color: #94a3b8;
        font-size: 11px;
        font-weight: 500;
      }
      #nextups-custom-titlebar .brand-badge {
        background: #1e293b;
        color: #94a3b8;
        border: 1px solid #334155;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 5px;
        font-weight: 600;
        letter-spacing: 0.2px;
      }
      #nextups-custom-titlebar .window-controls {
        display: flex;
        align-items: center;
        gap: 3px;
        -webkit-app-region: no-drag;
      }
      #nextups-custom-titlebar .win-btn-action {
        background: #1e293b;
        border: 1px solid #334155;
        color: #cbd5e1;
        padding: 3px 8px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        margin-right: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s ease;
      }
      #nextups-custom-titlebar .win-btn-action:hover {
        background: #2563eb;
        color: #ffffff;
        border-color: #2563eb;
      }
      #nextups-custom-titlebar .win-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        width: 36px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        border-radius: 5px;
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
          <div class="brand-group">
            <img class="brand-logo" src="${LOGO_BASE64}" alt="NextUps" />
            <span class="brand-title">NextUps</span>
            <span class="brand-divider">|</span>
            <span class="brand-desc">게임 업데이트 정보 통합 플랫폼</span>
            <span class="brand-badge">v${APP_VERSION}</span>
          </div>
          <div class="window-controls">
            <button class="win-btn-action" title="최신 버전 업데이트 확인" onclick="window.nextupsDesktop.checkUpdate()">
              <span>업데이트 확인</span>
            </button>
            <button class="win-btn" title="새로고침 (F5)" onclick="window.nextupsDesktop.reload()">&#x21bb;</button>
            <button class="win-btn" title="최소화" onclick="window.nextupsDesktop.minimize()">&#x2500;</button>
            <button class="win-btn" title="최대화 / 복원" onclick="window.nextupsDesktop.maximize()">&#x25a1;</button>
            <button class="win-btn close" title="닫기" onclick="window.nextupsDesktop.close()">&times;</button>
          </div>
        \`;
        document.body.prepend(bar);
      }
    `);
  });

  mainWindow.loadURL(PRODUCTION_URL).catch(() => {
    mainWindow.loadURL(LOCAL_URL);
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    setTimeout(() => {
      checkForUpdates(false);
    }, 2500);
  });
}

function checkForUpdates(isUserManualCheck = false) {
  const checkUrl = `${PRODUCTION_URL}/api/app/update?platform=windows&version=${APP_VERSION}`;

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
              title: "NextUps 새 버전 업데이트 안내",
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
        } else if (isUserManualCheck) {
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "NextUps 업데이트 확인",
            message: "현재 최신 버전을 사용 중입니다.",
            detail: `현재 설치된 버전: v${APP_VERSION}\n(최신 빌드 적용 완료)`,
            buttons: ["확인"],
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
      `${LOCAL_URL}/api/app/update?platform=windows&version=${APP_VERSION}`,
      handleResponse
    );
    fallbackReq.on("error", () => {
      if (isUserManualCheck) {
        dialog.showMessageBox(mainWindow, {
          type: "warning",
          title: "업데이트 서버 연결 실패",
          message: "업데이트 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
          buttons: ["확인"],
        });
      }
    });
  });
}

function startInAppUpdateDownload(downloadUrl, latestVersion) {
  if (!mainWindow) return;

  mainWindow.webContents.executeJavaScript(`
    let b = document.getElementById("nextups-inapp-update-bar");
    if (!b) {
      b = document.createElement("div");
      b.id = "nextups-inapp-update-bar";
      b.style.cssText = "position:fixed;top:38px;left:0;right:0;z-index:99999;background:#090d16;border-bottom:1px solid #2563eb;color:#fff;padding:12px 18px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;flex-direction:column;gap:8px;";
      b.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:12px;font-weight:bold;color:#f8fafc;">NextUps v\${${JSON.stringify(latestVersion)}} 업데이트 다운로드 중...</div>
          <div id="nextups-update-percent-text" style="font-size:12px;font-weight:800;color:#60a5fa;">0%</div>
        </div>
        <div style="background:#1e293b;height:7px;border-radius:4px;overflow:hidden;position:relative;">
          <div id="nextups-update-progress-fill" style="background:#2563eb;height:100%;width:0%;transition:width 0.2s ease;border-radius:4px;"></div>
        </div>
        <div id="nextups-update-status-detail" style="font-size:11px;color:#94a3b8;">공식 서버에서 최신 설치 패키지를 다운로드하고 있습니다...</div>
      \`;
      document.body.appendChild(b);
    }
  `);

  const tempFilePath = path.join(os.tmpdir(), `NextUps-Setup-v${latestVersion}.exe`);
  const fileStream = fs.createWriteStream(tempFilePath);

  const fetchUrl = (targetUrl) => {
    const client = targetUrl.startsWith("https") ? https : http;
    client.get(targetUrl, (res) => {
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
            if (st) st.innerText = "다운로드 진행 중: ${dlMB}MB / ${totalMB}MB (${percent}%) • ${speedMB} MB/s";
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
          if (st) st.innerText = "다운로드 완료! 안전하게 최신 버전을 설치합니다...";
        `).catch(() => {});

        setTimeout(() => {
          try {
            spawn(tempFilePath, [], { detached: true, stdio: "ignore" }).unref();
            app.quit();
          } catch (launchErr) {
            console.error("Installer launch error:", launchErr);
          }
        }, 900);
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

// IPC Handlers
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
  checkForUpdates(true);
  return { status: "checking" };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
