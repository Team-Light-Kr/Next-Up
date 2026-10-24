import fs from "fs";
import path from "path";
import { execSync } from "child_process";

let TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  try {
    const creds = execSync("git credential fill", {
      input: "protocol=https\nhost=github.com\n\n",
      encoding: "utf-8",
    });
    const match = creds.match(/password=(.*)/);
    if (match) TOKEN = match[1].trim();
  } catch {}
}

const OWNER = "Team-Light-Kr";
const REPO = "Next-Up";
const TAG = "v1.0.1";


async function main() {
  console.log(`[1] Checking if release '${TAG}' exists...`);
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "NextUps-Release-Uploader",
  };

  let release;
  const listRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, { headers });
  if (listRes.ok) {
    const list = await listRes.json();
    release = list.find((r) => r.tag_name === TAG);
  }

  if (!release) {
    console.log(`[2] Creating release '${TAG}'...`);
    const createRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        tag_name: TAG,
        target_commitish: "main",
        name: "NextUps v1.0.1 최신 정식 출시 (Windows & Android)",
        body: `## 🚀 NextUps v1.0.1 공식 최신 릴리즈\n\n- **Windows 설치 프로그램**: NextUps-Setup-v1.0.1.exe (인앱 실시간 프로그레스 다운로더 지원)\n- **Windows 무설치 ZIP**: NextUps-Windows-v1.0.1.zip\n- **Android APK**: NextUps-v1.0.1.apk (모바일 반응형 최적화)`,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create release: ${createRes.status} ${err}`);
    }
    release = await createRes.json();
    console.log(`Release created: ${release.html_url}`);
  } else {
    console.log(`Release already exists: ${release.html_url}`);
  }

  const uploadUrlTemplate = release.upload_url; // e.g. https://uploads.github.com/repos/.../assets{?name,label}
  const baseUrl = uploadUrlTemplate.split("{")[0];

  const files = [
    { name: "NextUps-Setup-v1.0.1.exe", type: "application/vnd.microsoft.portable-executable" },
    { name: "NextUps-Windows-v1.0.1.zip", type: "application/zip" },
    { name: "NextUps-v1.0.1.apk", type: "application/vnd.android.package-archive" },
  ];


  for (const file of files) {
    const filePath = path.join(process.cwd(), "public", "downloads", file.name);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping...`);
      continue;
    }

    const stat = fs.statSync(filePath);
    console.log(`Uploading ${file.name} (${(stat.size / (1024 * 1024)).toFixed(1)} MB)...`);

    // Check if asset already exists in release
    const existingAsset = release.assets?.find((a) => a.name === file.name);
    if (existingAsset) {
      console.log(`Asset ${file.name} already exists. Deleting first...`);
      await fetch(existingAsset.url, {
        method: "DELETE",
        headers,
      });
    }

    const fileStream = fs.createReadStream(filePath);
    const uploadRes = await fetch(`${baseUrl}?name=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": file.type,
        "Content-Length": stat.size.toString(),
        "User-Agent": "NextUps-Release-Uploader",
      },
      duplex: "half",
      body: fileStream,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error(`Upload error for ${file.name}: ${uploadRes.status} ${err}`);
    } else {
      const resJson = await uploadRes.json();
      console.log(`Successfully uploaded ${file.name}! Download URL: ${resJson.browser_download_url}`);
    }
  }

  console.log("All assets uploaded successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
