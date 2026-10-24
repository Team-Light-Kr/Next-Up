import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const gameSlug = searchParams.get('game');

    const where: any = {};
    if (gameSlug) {
      where.slug = gameSlug;
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        platforms: {
          include: {
            platform: true,
          },
        },
        updates: {
          include: {
            platform: true,
            sections: {
              orderBy: { order: 'asc' },
            },
            translations: true,
          },
          orderBy: {
            releaseDate: 'desc',
          },
        },
      },
    });

    const exportData = {
      exportTimestamp: new Date().toISOString(),
      service: 'NextUps (https://nextups.xyz)',
      totalGames: games.length,
      games: games.map((g) => ({
        id: g.id,
        slug: g.slug,
        canonicalName: g.canonicalName,
        developer: g.developer,
        publisher: g.publisher,
        officialWebsiteUrl: g.officialWebsiteUrl,
        description: g.description,
        platforms: g.platforms.map((gp) => ({
          platform: gp.platform.name,
          platformKey: gp.platform.key,
          latestKnownVersion: gp.latestKnownVersion,
          availabilityStatus: gp.availabilityStatus,
          storeUrl: gp.storeUrl,
          lastCheckedAt: gp.lastCheckedAt,
        })),
        updates: g.updates.map((u) => ({
          id: u.id,
          version: u.version,
          title: u.title,
          releaseDate: u.releaseDate,
          updateType: u.updateType,
          sourceUrl: u.sourceUrl,
          sourceName: u.sourceName,
          platform: u.platform.name,
          sections: u.sections.map((s) => ({
            title: s.title,
            content: s.content,
            order: s.order,
          })),
        })),
      })),
    };

    if (format === 'download') {
      const jsonString = JSON.stringify(exportData, null, 2);
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="nextup-export-${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
