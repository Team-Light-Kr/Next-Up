import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GitHub Releases 공식 영구 CDN 다운로드 베이스 URL (v1.0.1 최신)
const GITHUB_RELEASE_BASE =
  "https://github.com/Team-Light-Kr/Next-Up/releases/download/v1.0.1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileType = searchParams.get("file")?.toLowerCase() || "exe"; // exe, zip, apk
  const requestedVersion = searchParams.get("v") || "v1.0.1";

  let fileName = "NextUps-Setup-v1.0.1.exe";
  let contentType = "application/vnd.microsoft.portable-executable";

  if (fileType === "zip") {
    fileName = "NextUps-Windows-v1.0.1.zip";
    contentType = "application/zip";
  } else if (fileType === "apk") {
    fileName = "NextUps-v1.0.1.apk";
    contentType = "application/vnd.android.package-archive";
  }


  const downloadsDir = path.join(process.cwd(), "public", "downloads");
  const filePath = path.join(downloadsDir, fileName);

  // 로컬에 파일이 실제로 존재하는 경우 (개발 환경 또는 파일 포함 빌드)
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

  // Vercel Serverless / 프로덕션 환경: 대용량 바이너리(80MB+)는 GitHub Releases CDN으로 302 리디렉션
  const remoteDownloadUrl = `${GITHUB_RELEASE_BASE}/${fileName}`;
  return NextResponse.redirect(remoteDownloadUrl, 302);
}

