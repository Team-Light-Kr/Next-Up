import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 전송되지 않았습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize extension
    const originalExt = path.extname(file.name).toLowerCase() || ".png";
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const ext = allowedExts.includes(originalExt) ? originalExt : ".png";

    // Unique filename
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "이미지 업로드에 실패했습니다.", detail: error.message }, { status: 500 });
  }
}
