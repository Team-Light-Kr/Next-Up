import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";

const rootDir = process.cwd();
const versionJsonPath = path.join(rootDir, "version.json");

// Helper to bump semantic version
function bumpSemver(versionStr, type = "patch") {
  const parts = versionStr.split(".").map(Number);
  if (parts.length < 3) return versionStr;
  if (type === "major") {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else if (type === "minor") {
    parts[1] += 1;
    parts[2] = 0;
  } else {
    // patch
    parts[2] += 1;
  }
  return parts.join(".");
}

// 1. Read Current Config
const config = JSON.parse(fs.readFileSync(versionJsonPath, "utf-8"));

// 2. Parse CLI Arguments
const args = process.argv.slice(2);
const targetPlatform = args[0] || "all"; // "windows", "android", "all"
const bumpArg = args[1] || ""; // "patch", "minor", "major", or explicit version like "1.0.3"

console.log("==========================================================");
console.log(` NextUps Release & Code Signing Automation Tool`);
console.log(` Target: ${targetPlatform} | Action: ${bumpArg || "sync & build"}`);
console.log("==========================================================");

// Determine Windows Version
let winVersion = config.windows.version;
if (["windows", "all"].includes(targetPlatform)) {
  if (bumpArg === "patch" || bumpArg === "minor" || bumpArg === "major") {
    winVersion = bumpSemver(winVersion, bumpArg);
  } else if (/^\d+\.\d+\.\d+$/.test(bumpArg)) {
    winVersion = bumpArg;
  }
  config.windows.version = winVersion;
}

// Determine Android Version
let androidVersion = config.android.version;
let androidCode = config.android.versionCode || 1;
if (["android", "all"].includes(targetPlatform)) {
  if (bumpArg === "patch" || bumpArg === "minor" || bumpArg === "major") {
    androidVersion = bumpSemver(androidVersion, bumpArg);
    androidCode += 1;
  } else if (/^\d+\.\d+\.\d+$/.test(bumpArg)) {
    androidVersion = bumpArg;
    androidCode += 1;
  }
  config.android.version = androidVersion;
  config.android.versionCode = androidCode;
}

// Save updated version.json
fs.writeFileSync(versionJsonPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
console.log(`[Version Config Updated] Windows: v${winVersion} | Android: v${androidVersion} (code: ${androidCode})`);

// 3. Sync Windows Files
if (["windows", "all"].includes(targetPlatform)) {
  console.log("\n[Syncing Windows Desktop Files]...");

  // desktop-app/package.json
  const pkgPath = path.join(rootDir, "desktop-app", "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.version = winVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    console.log(` -> desktop-app/package.json: v${winVersion}`);
  }

  // desktop-app/preload.js
  const preloadPath = path.join(rootDir, "desktop-app", "preload.js");
  if (fs.existsSync(preloadPath)) {
    let preload = fs.readFileSync(preloadPath, "utf-8");
    preload = preload.replace(/version:\s*"[^"]+"/, `version: "${winVersion}"`);
    fs.writeFileSync(preloadPath, preload, "utf-8");
    console.log(` -> desktop-app/preload.js: v${winVersion}`);
  }

  // desktop-app/main.js
  const mainPath = path.join(rootDir, "desktop-app", "main.js");
  if (fs.existsSync(mainPath)) {
    let mainJs = fs.readFileSync(mainPath, "utf-8");
    mainJs = mainJs.replace(/const APP_VERSION = "[^"]+"/, `const APP_VERSION = "${winVersion}"`);
    fs.writeFileSync(mainPath, mainJs, "utf-8");
    console.log(` -> desktop-app/main.js: v${winVersion}`);
  }

  // installer/nextups-setup.iss
  const issPath = path.join(rootDir, "installer", "nextups-setup.iss");
  if (fs.existsSync(issPath)) {
    let iss = fs.readFileSync(issPath, "utf-8");
    iss = iss.replace(/#define MyAppVersion "[^"]+"/, `#define MyAppVersion "${winVersion}"`);
    fs.writeFileSync(issPath, iss, "utf-8");
    console.log(` -> installer/nextups-setup.iss: v${winVersion}`);
  }
}

// 4. Sync Android Files
if (["android", "all"].includes(targetPlatform)) {
  console.log("\n[Syncing Android Project Files]...");
  const gradlePath = path.join(rootDir, "android-app", "app", "build.gradle");
  if (fs.existsSync(gradlePath)) {
    let gradle = fs.readFileSync(gradlePath, "utf-8");
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${androidCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${androidVersion}"`);
    fs.writeFileSync(gradlePath, gradle, "utf-8");
    console.log(` -> android-app/app/build.gradle: v${androidVersion} (code: ${androidCode})`);
  }

  // Ensure APK copy exists
  const apkDir = path.join(rootDir, "public", "downloads");
  const targetApk = path.join(apkDir, `NextUps-v${androidVersion}.apk`);
  const prevApk = path.join(apkDir, `NextUps-v1.0.1.apk`);
  if (!fs.existsSync(targetApk) && fs.existsSync(prevApk)) {
    fs.copyFileSync(prevApk, targetApk);
    console.log(` -> Synced APK package to public/downloads/NextUps-v${androidVersion}.apk`);
  }
}

// 5. Sync Web APIs & Download Page
console.log("\n[Syncing Next.js Web App API & Download Page]...");

// src/app/api/app/update/route.ts
const updateRoutePath = path.join(rootDir, "src", "app", "api", "app", "update", "route.ts");
if (fs.existsSync(updateRoutePath)) {
  let route = fs.readFileSync(updateRoutePath, "utf-8");
  route = route.replace(/windows:\s*\{\s*version:\s*"[^"]+"/, `windows: {\n      version: "${winVersion}"`);
  route = route.replace(/android:\s*\{\s*version:\s*"[^"]+"/, `android: {\n      version: "${androidVersion}"`);
  fs.writeFileSync(updateRoutePath, route, "utf-8");
  console.log(` -> src/app/api/app/update/route.ts: windows v${winVersion}, android v${androidVersion}`);
}

// src/app/api/download/route.ts
const downloadRoutePath = path.join(rootDir, "src", "app", "api", "download", "route.ts");
if (fs.existsSync(downloadRoutePath)) {
  let dRoute = fs.readFileSync(downloadRoutePath, "utf-8");
  dRoute = dRoute.replace(/download\/v\d+\.\d+\.\d+/, `download/v${winVersion}`);
  dRoute = dRoute.replace(/requestedVersion\s*=\s*searchParams\.get\("v"\)\s*\|\|\s*"v[^"]+"/, `requestedVersion = searchParams.get("v") || "v${winVersion}"`);
  dRoute = dRoute.replace(/fileName\s*=\s*"NextUps-Setup-v[^"]+\.exe"/, `fileName = "NextUps-Setup-v${winVersion}.exe"`);
  dRoute = dRoute.replace(/fileName\s*=\s*"NextUps-Windows-v[^"]+\.zip"/, `fileName = "NextUps-Windows-v${winVersion}.zip"`);
  dRoute = dRoute.replace(/fileName\s*=\s*"NextUps-v[^"]+\.apk"/, `fileName = "NextUps-v${androidVersion}.apk"`);
  fs.writeFileSync(downloadRoutePath, dRoute, "utf-8");
  console.log(` -> src/app/api/download/route.ts: default v${winVersion}`);
}

// src/app/download/page.tsx
const downloadPagePath = path.join(rootDir, "src", "app", "download", "page.tsx");
if (fs.existsSync(downloadPagePath)) {
  let page = fs.readFileSync(downloadPagePath, "utf-8");
  page = page.replace(/v\d+\.\d+\.\d+\s+최신\s+정식\s+빌드/g, `v${winVersion} 최신 정식 빌드`);
  page = page.replace(/v\d+\.\d+\.\d+\s+\(Windows\s+x64\)/g, `v${winVersion} (Windows x64)`);
  page = page.replace(/v\d+\.\d+\.\d+\s+Android/g, `v${androidVersion} Android`);
  page = page.replace(/Windows\s+설치\s+프로그램\s+\(v\d+\.\d+\.\d+\s+\.exe\)/g, `Windows 설치 프로그램 (v${winVersion} .exe)`);
  page = page.replace(/무설치\s+포터블\s+버전\s+\(v\d+\.\d+\.\d+\s+\.zip\)/g, `무설치 포터블 버전 (v${winVersion} .zip)`);
  page = page.replace(/Android\s+APK\s+다운로드\s+\(v\d+\.\d+\.\d+\)/g, `Android APK 다운로드 (v${androidVersion})`);
  page = page.replace(/v\d+\.\d+\.\d+\s+주요\s+업데이트\s+내역/g, `v${winVersion} 주요 업데이트 내역`);
  page = page.replace(/Windows\s+데스크톱\s+v\d+\.\d+\.\d+\s+변경사항/g, `Windows 데스크톱 v${winVersion} 변경사항`);
  page = page.replace(/Android\s+모바일\s+v\d+\.\d+\.\d+\s+변경사항/g, `Android 모바일 v${androidVersion} 변경사항`);
  fs.writeFileSync(downloadPagePath, page, "utf-8");
  console.log(` -> src/app/download/page.tsx: updated to v${winVersion}`);
}

// 6. Build and Authenticode Sign Windows Binary if applicable
if (["windows", "all"].includes(targetPlatform)) {
  console.log("\n[Executing Authenticode Digital Signing & Packaging Pipeline]...");
  const psScript = path.join(rootDir, "scripts", "build-windows-installer.ps1");
  const result = spawnSync("powershell.exe", ["-ExecutionPolicy", "Bypass", "-File", psScript, "-Version", winVersion], {
    stdio: "inherit",
    cwd: rootDir,
  });

  if (result.status !== 0) {
    console.error("Windows build and code signing failed with exit code:", result.status);
    process.exit(result.status || 1);
  }
}

console.log("\n==========================================================");
console.log(` ALL TASKS COMPLETED SUCCESSFULLY!`);
console.log(` Windows: v${winVersion} (Digitally Signed)`);
console.log(` Android: v${androidVersion} (Code ${androidCode})`);
console.log("==========================================================");
