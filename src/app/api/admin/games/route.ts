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
      slug,
      canonicalName,
      description,
      developer,
      publisher,
      officialWebsiteUrl,
      iconUrl,
      coverImageUrl,
      genres,
      platforms, // array of { platformKey, storeUrl, latestKnownVersion }
    } = body;

    if (!slug || !canonicalName || !description) {
      return NextResponse.json(
        { error: "slug, canonicalName, description are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.game.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 존재하는 게임 슬러그(slug)입니다." },
        { status: 409 }
      );
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        slug: slug.trim().toLowerCase(),
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

    // Link platforms if provided
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

    await logToDiscord({
      action: "ADMIN_GAME_CREATED",
      title: `🎮 관리자 게임 공식 등록: ${game.canonicalName}`,
      color: 0x2563eb,
      userId: currentUser.id,
      userEmail: currentUser.email,
      details: {
        gameId: game.id,
        slug: game.slug,
        canonicalName: game.canonicalName,
        developer: game.developer,
        genres: game.genres,
      },
    });

    return NextResponse.json({ success: true, game });
  } catch (error: any) {
    console.error("Admin Game Creation error:", error);
    return NextResponse.json(
      { error: "Failed to create game", detail: error.message },
      { status: 500 }
    );
  }
}
