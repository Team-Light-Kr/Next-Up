import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileType = searchParams.get("file") || "exe"; // exe, zip, apk

  const downloadsDir = path.join(process.cwd(), "public", "downloads");

  let fileName = "NextUps-Setup-v1.0.0.exe";
  if (fileType === "zip") {
    fileName = "NextUps-Windows-v1.0.0.zip";
  } else if (fileType === "apk") {
    fileName = "NextUps-v1.0.0.apk";
  }

  const filePath = path.join(downloadsDir, fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  // Convert Node ReadStream to Web ReadableStream
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
      "Content-Type": fileType === "zip" ? "application/zip" : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": stat.size.toString(),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
