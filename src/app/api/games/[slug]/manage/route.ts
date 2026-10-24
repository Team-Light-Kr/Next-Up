import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";
import { invalidateGamesCache } from "@/lib/games-cache";

interface RouteProps {
  params: Promise<{
    slug: string;
  }>;
}

// UPDATE (수정)
export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      return NextResponse.json({ error: "해당 게임을 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await request.json();
    const {
      canonicalName,
      description,
      developer,
      publisher,
      officialWebsiteUrl,
      iconUrl,
      coverImageUrl,
      genres,
      status,
    } = body;

    const updatedGame = await prisma.game.update({
      where: { slug },
      data: {
        canonicalName: canonicalName !== undefined ? canonicalName.trim() : game.canonicalName,
        description: description !== undefined ? description.trim() : game.description,
        developer: developer !== undefined ? developer?.trim() || null : game.developer,
        publisher: publisher !== undefined ? publisher?.trim() || null : game.publisher,
        officialWebsiteUrl: officialWebsiteUrl !== undefined ? officialWebsiteUrl?.trim() || null : game.officialWebsiteUrl,
        iconUrl: iconUrl !== undefined ? iconUrl?.trim() || null : game.iconUrl,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl?.trim() || null : game.coverImageUrl,
        genres: Array.isArray(genres) ? genres : game.genres,
        status: status || game.status,
      },
    });

    // Invalidate in-memory games cache immediately
    invalidateGamesCache();

    // Log to Discord
    await logToDiscord({
      action: "GAME_UPDATE",
      title: `게임 데이터 수정: ${updatedGame.canonicalName}`,
      description: `${currentUser.displayName} (${currentUser.email})님이 게임 데이터를 수정했습니다.`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      details: {
        slug: updatedGame.slug,
        developer: updatedGame.developer,
        role: currentUser.role,
      },
    });

    return NextResponse.json({ success: true, game: updatedGame });
  } catch (error: any) {
    console.error("Game update error:", error);
    return NextResponse.json({ error: "게임 수정 실패", detail: error.message }, { status: 500 });
  }
}

// DELETE (삭제)
export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      return NextResponse.json({ error: "해당 게임을 찾을 수 없습니다." }, { status: 404 });
    }

    // Cascade delete relations
    await prisma.$transaction([
      prisma.gameFollow.deleteMany({ where: { gameId: game.id } }),
      prisma.gamePlatform.deleteMany({ where: { gameId: game.id } }),
      prisma.update.deleteMany({ where: { gameId: game.id } }),
      prisma.report.deleteMany({ where: { gameId: game.id } }),
      prisma.game.delete({ where: { id: game.id } }),
    ]);

    // Invalidate in-memory games cache
    invalidateGamesCache();

    // Log to Discord
    await logToDiscord({
      action: "SECURITY_ALERT",
      title: `게임 삭제 완료: ${game.canonicalName}`,
      description: `${currentUser.displayName} (${currentUser.email})님이 게임 데이터를 영구 삭제했습니다.`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      details: {
        deletedSlug: slug,
        gameId: game.id,
      },
      color: 0xef4444,
    });

    return NextResponse.json({ success: true, message: "게임이 삭제되었습니다." });
  } catch (error: any) {
    console.error("Game delete error:", error);
    return NextResponse.json({ error: "게임 삭제 실패", detail: error.message }, { status: 500 });
  }
}
