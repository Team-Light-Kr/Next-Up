import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ games: [], updates: [] });
    }

    const [games, updates] = await Promise.all([
      prisma.game.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { canonicalName: { contains: query.trim(), mode: "insensitive" } },
            { developer: { contains: query.trim(), mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          slug: true,
          canonicalName: true,
          iconUrl: true,
          developer: true,
        },
      }),
      prisma.update.findMany({
        where: {
          OR: [
            { title: { contains: query.trim(), mode: "insensitive" } },
            { summary: { contains: query.trim(), mode: "insensitive" } },
            { version: { contains: query.trim(), mode: "insensitive" } },
          ],
        },
        take: 5,
        include: {
          game: { select: { slug: true, canonicalName: true } },
          platform: { select: { key: true, name: true } },
        },
      }),
    ]);

    return NextResponse.json({ games, updates });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
