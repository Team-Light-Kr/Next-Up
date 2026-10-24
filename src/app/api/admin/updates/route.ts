import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser && (currentUser.role === "ADMIN" || currentUser.email === "admin@koharu.live");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다. 관리자만 이용할 수 있습니다." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      gameId,
      platformKey,
      version,
      title,
      releaseDate,
      summary,
      bodyMarkdown,
      updateType,
      sourceUrl,
      sourceName,
      images,
      sections,
    } = body;

    if (!gameId || !platformKey || !version || !title || !bodyMarkdown) {
      return NextResponse.json(
        { error: "gameId, platformKey, version, title, bodyMarkdown are required" },
        { status: 400 }
      );
    }

    const platform = await prisma.platform.findUnique({
      where: { key: platformKey.toLowerCase() },
    });

    if (!platform) {
      return NextResponse.json({ error: "Platform not found" }, { status: 404 });
    }

    // Find or create GamePlatform relation
    let gamePlatform = await prisma.gamePlatform.findUnique({
      where: {
        gameId_platformId: {
          gameId,
          platformId: platform.id,
        },
      },
    });

    if (!gamePlatform) {
      gamePlatform = await prisma.gamePlatform.create({
        data: {
          gameId,
          platformId: platform.id,
          latestKnownVersion: version.trim(),
          lastCheckedAt: new Date(),
        },
      });
    } else {
      // Update latest known version
      await prisma.gamePlatform.update({
        where: { id: gamePlatform.id },
        data: {
          latestKnownVersion: version.trim(),
          lastCheckedAt: new Date(),
        },
      });
    }

    // Create Update
    const update = await prisma.update.create({
      data: {
        gameId,
        platformId: platform.id,
        gamePlatformId: gamePlatform.id,
        version: version.trim(),
        title: title.trim(),
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        summary: summary?.trim() || null,
        bodyMarkdown: bodyMarkdown.trim(),
        updateType: updateType || "PATCH",
        isVerified: true,
        sourceUrl: sourceUrl?.trim() || null,
        sourceName: sourceName?.trim() || null,
        images: Array.isArray(images) ? images.slice(0, 20) : [],
        sections:
          Array.isArray(sections) && sections.length > 0
            ? {
                create: sections.map((s: any, idx: number) => ({
                  title: s.title,
                  content: s.content,
                  order: idx + 1,
                })),
              }
            : undefined,
      },
    });

    await logToDiscord({
      action: "ADMIN_UPDATE_CREATED",
      title: `신규 패치노트 발행: [${update.version}] ${update.title}`,
      color: 0x3b82f6,
      userId: currentUser.id,
      userEmail: currentUser.email,
      details: {
        updateId: update.id,
        version: update.version,
        title: update.title,
        updateType: update.updateType,
        sourceUrl: update.sourceUrl,
      },
    });

    return NextResponse.json({ success: true, update });
  } catch (error: any) {
    console.error("Admin Update Creation error:", error);
    return NextResponse.json(
      { error: "Failed to create update", detail: error.message },
      { status: 500 }
    );
  }
}
