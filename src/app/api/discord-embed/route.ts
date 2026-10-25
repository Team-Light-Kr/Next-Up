import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildHomeEmbed,
  buildGamesListEmbed,
  buildGameEmbed,
  buildUpdateEmbed,
  buildPlatformEmbed,
  buildCompareEmbed,
  buildDownloadEmbed,
  buildTermsEmbed,
  buildPrivacyEmbed,
  buildPrivacyNoticeEmbed,
  buildPrivacyNoticeUserEmbed,
  buildYouthEmbed,
  buildNotificationsEmbed,
  buildAuditLogEmbed,
  buildProfileEmbed,
  buildGenericEmbed,
  toComponentEmbedJson,
} from "@/lib/discord-component-embed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  let card: any = null;

  try {
    if (path === "/" || path === "") {
      card = buildHomeEmbed(appUrl);
    } else if (path === "/games") {
      const count = await prisma.game.count({ where: { status: "ACTIVE" } });
      card = buildGamesListEmbed(count, appUrl);
    } else if (path.startsWith("/games/")) {
      const rawSlug = decodeURIComponent(path.replace("/games/", ""));
      const SLUG_ALIASES: Record<string, string> = {
        "spiderman-2": "marvel-spider-man-2",
        "pokemon-sv": "pokemon-scarlet-violet",
        "god-of-war": "god-of-war-ragnarok",
        "zelda": "zelda-totk",
      };
      const slug = SLUG_ALIASES[rawSlug] || rawSlug;
      const game = await prisma.game.findFirst({
        where: {
          OR: [
            { slug },
            { slug: rawSlug },
            { canonicalName: slug },
            { canonicalName: { contains: rawSlug, mode: "insensitive" } },
          ],
        },
        include: {
          updates: {
            orderBy: { releaseDate: "desc" },
            take: 1,
          },
        },
      });
      if (game) {
        card = buildGameEmbed(game, game.updates[0]?.version, appUrl);
      }
    } else if (path.startsWith("/updates/")) {
      const id = path.replace("/updates/", "");
      const update = await prisma.update.findUnique({
        where: { id },
        include: {
          game: { select: { canonicalName: true, slug: true, iconUrl: true } },
        },
      });
      if (update) {
        card = buildUpdateEmbed(update as any, appUrl);
      }
    } else if (path.startsWith("/profile/")) {
      const code = path.replace("/profile/", "");
      const user = await prisma.user.findUnique({
        where: { profileCode: code },
        include: {
          _count: { select: { follows: true } },
        },
      });
      if (user) {
        card = buildProfileEmbed(
          {
            displayName: user.displayName,
            email: user.email,
            profileCode: user.profileCode,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
            followsCount: user._count.follows,
          },
          appUrl
        );
      }
    } else if (path.startsWith("/platforms/")) {
      const pKey = path.replace("/platforms/", "");
      const platform = await prisma.platform.findUnique({ where: { key: pKey } });
      if (platform) {
        card = buildPlatformEmbed(
          {
            key: platform.key,
            name: platform.name,
            description: platform.description || undefined,
          },
          undefined,
          appUrl
        );
      }
    } else if (path.startsWith("/admin/logs/")) {
      const id = path.replace("/admin/logs/", "");
      const log = await prisma.adminAuditLog.findUnique({
        where: { id },
        include: { user: { select: { displayName: true, email: true } } },
      });
      if (log) {
        card = buildAuditLogEmbed(
          {
            id: log.id,
            title: log.title || "NextUps 로그",
            action: log.action || "SYSTEM_AUDIT",
            details: log.details,
            userEmail: log.user?.email,
          },
          appUrl
        );
      }
    } else if (path === "/compare") {
      card = buildCompareEmbed(appUrl);
    } else if (path === "/download") {
      card = buildDownloadEmbed(appUrl);
    } else if (path === "/legal/terms") {
      card = buildTermsEmbed(appUrl);
    } else if (path === "/legal/privacy") {
      card = buildPrivacyEmbed(appUrl);
    } else if (path === "/legal/privacy-notice") {
      card = buildPrivacyNoticeEmbed(appUrl);
    } else if (path.startsWith("/legal/privacy-notice/")) {
      const code = path.replace("/legal/privacy-notice/", "");
      const user = await prisma.user.findUnique({ where: { profileCode: code } });
      if (user) {
        card = buildPrivacyNoticeUserEmbed(user, appUrl);
      }
    } else if (path === "/legal/youth") {
      card = buildYouthEmbed(appUrl);
    } else if (path === "/notifications") {
      card = buildNotificationsEmbed(appUrl);
    } else {
      card = buildGenericEmbed(
        "NextUps 멀티플랫폼 게임 업데이트",
        "Windows, PlayStation, Nintendo Switch, Android, iOS, macOS 공식 패치노트와 최신 버전 정보를 확인하세요.",
        path,
        "페이지 열기",
        appUrl
      );
    }
  } catch (err) {
    console.error("Universal Discord embed generation error:", err);
  }

  if (!card) {
    card = buildHomeEmbed(appUrl);
  }

  const jsonStr = toComponentEmbedJson(card);

  return new Response(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.discord.component-embed+json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
