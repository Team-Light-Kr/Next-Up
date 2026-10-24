import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GitHub Releases 공식 영구 CDN 다운로드 베이스 URL (v1.0.2 최신)
const GITHUB_RELEASE_BASE =
  "https://github.com/Team-Light-Kr/Next-Up/releases/download/v1.0.3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileType = searchParams.get("file")?.toLowerCase() || "exe"; // exe, zip, apk
  const requestedVersion = searchParams.get("v") || "v1.0.3";

  let fileName = "NextUps-Setup-v1.0.3.exe";
  let contentType = "application/vnd.microsoft.portable-executable";

  if (fileType === "zip") {
    fileName = "NextUps-Windows-v1.0.3.zip";
    contentType = "application/zip";
  } else if (fileType === "apk") {
    fileName = "NextUps-v1.0.3.apk";
    contentType = "application/vnd.android.package-archive";
  }

  const downloadsDir = path.join(process.cwd(), "public", "downloads");
  let filePath = path.join(downloadsDir, fileName);

  // 로컬 폴더에 최신 파일이 없으면 v1.0.1 파일로 유연하게 폴백
  if (!fs.existsSync(filePath)) {
    const fallbackName = fileName.replace("1.0.2", "1.0.1");
    const fallbackPath = path.join(downloadsDir, fallbackName);
    if (fs.existsSync(fallbackPath)) {
      filePath = fallbackPath;
      fileName = fallbackName;
    }
  }

  // 로컬에 파일이 실제로 존재하는 경우
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": stat.size.toString(),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // CDN 리디렉션
  const remoteDownloadUrl = `${GITHUB_RELEASE_BASE}/${fileName}`;
  return NextResponse.redirect(remoteDownloadUrl, 302);
}
