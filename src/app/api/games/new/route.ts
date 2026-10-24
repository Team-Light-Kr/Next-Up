import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";
import { invalidateGamesCache } from "@/lib/games-cache";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      canonicalName,
      description,
      developer,
      publisher,
      officialWebsiteUrl,
      iconUrl,
      coverImageUrl,
      genres,
      platforms,
    } = body;

    if (!slug || !canonicalName || !description) {
      return NextResponse.json(
        { error: "게임명, 고유 식별자(slug), 게임 소개는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const existing = await prisma.game.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 동일한 식별자(slug)의 게임이 등록되어 있습니다." },
        { status: 409 }
      );
    }

    const game = await prisma.game.create({
      data: {
        slug: cleanSlug,
        canonicalName: canonicalName.trim(),
        description: description.trim(),
        developer: developer?.trim() || null,
        publisher: publisher?.trim() || null,
        officialWebsiteUrl: officialWebsiteUrl?.trim() || null,
        iconUrl: iconUrl?.trim() || null,
        coverImageUrl: coverImageUrl?.trim() || null,
        genres: Array.isArray(genres) ? genres : [],
        status: "ACTIVE",
      },
    });

    if (Array.isArray(platforms) && platforms.length > 0) {
      for (const p of platforms) {
        const plat = await prisma.platform.findUnique({
          where: { key: p.platformKey.toLowerCase() },
        });
        if (plat) {
          await prisma.gamePlatform.create({
            data: {
              gameId: game.id,
              platformId: plat.id,
              latestKnownVersion: p.latestKnownVersion?.trim() || null,
              storeUrl: p.storeUrl?.trim() || null,
              availabilityStatus: "AVAILABLE",
              lastCheckedAt: new Date(),
            },
          });
        }
      }
    }

    // Dispatch audit log to Discord
    await logToDiscord({
      action: "GAME_CREATE",
      title: `신규 게임 등록: ${game.canonicalName}`,
      description: `회원 ${user.displayName} (${user.email})님이 새로운 게임 정보를 등록했습니다.`,
      userId: user.id,
      userEmail: user.email,
      details: {
        gameId: game.id,
        slug: game.slug,
        developer: game.developer,
        platformCount: platforms?.length || 0,
      },
    });

    // Invalidate in-memory games cache immediately
    invalidateGamesCache();

    return NextResponse.json({ success: true, game });
  } catch (error: any) {
    console.error("Member game create error:", error);
    return NextResponse.json({ error: "게임 등록 실패", detail: error.message }, { status: 500 });
  }
}
