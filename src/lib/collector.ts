import prisma from "@/lib/prisma";
import { logToDiscord } from "@/lib/discord";
import { invalidateGamesCache } from "@/lib/games-cache";

export interface CollectorResult {
  jobId: string;
  source: string;
  itemsFound: number;
  itemsAdded: number;
  itemsSkipped: number;
  durationMs: number;
  logs: string[];
  collectedGames: { gameName: string; version: string; title: string; updateType: string }[];
}

/**
 * Advanced BBCode & HTML to Markdown Converter
 * Fixes broken list alignments, image tags, and Steam clan image CDN links
 */
export function convertToMarkdown(rawText: string): string {
  if (!rawText) return "";

  const STEAM_CDN = "https://clan.cloudflare.steamstatic.com/images";

  let md = rawText
    // 1. Expand Steam Clan Image CDN variables
    .replace(/\{STEAM_CLAN_IMAGE\}/gi, STEAM_CDN)
    .replace(/\{STEAM_CLAN_LOC_IMAGE\}/gi, STEAM_CDN)
    // 2. Remove Steam-specific video / youtube wrapper tags
    .replace(/\[previewyoutube=[^\]]*\]\[\/previewyoutube\]/gi, "")
    .replace(/\[\/?previewyoutube[^\]]*\]/gi, "")
    // 3. Headings with clean line breaks
    .replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, "\n\n# $1\n\n")
    .replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, "\n\n## $1\n\n")
    .replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, "\n\n### $1\n\n")
    // 4. Text Formatting
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "**$1**")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "*$1*")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "__$1__")
    .replace(/\[strike\]([\s\S]*?)\[\/strike\]/gi, "~~$1~~")
    // 5. Links
    .replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, "[$2]($1)")
    // 6. Images - BBCode [img] and HTML <img>
    .replace(/\[img\]\s*(.*?)\s*\[\/img\]/gi, "\n\n![패치 이미지]($1)\n\n")
    .replace(/<img[^>]+src=["'](.*?)["'][^>]*>/gi, "\n\n![패치 이미지]($1)\n\n")
    // 7. Lists: convert [*] into clean Markdown bullet points with proper newlines
    .replace(/\[list\]/gi, "\n\n")
    .replace(/\[\/list\]/gi, "\n\n")
    .replace(/\[\*\]\s*([^\n\[]+)/gi, "- $1\n")
    // 8. Code & Quote Blocks
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "\n```\n$1\n```\n")
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, "\n> $1\n")
    // 9. HTML line breaks & paragraphs
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<a\s+href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    // 10. HTML Entities
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, " ");

  // 11. Catch any naked Steam CDN image URLs not wrapped in markdown image syntax
  md = md.replace(
    /(?<!\!\[[^\]]*\]\()(https:\/\/clan\.cloudflare\.steamstatic\.com\/images\/[^\s\)\"\']+)/gi,
    "\n\n![패치 이미지]($1)\n\n"
  );

  // 12. Normalize multiple empty lines to clean markdown paragraphs
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Intelligent Semantic Version Extractor
 * Never falls back to generic placeholders like "공식 정기 패치" or "최신 확인 버전"
 */
export function extractVersion(title: string, content: string, releaseDate?: Date): string {
  const combined = `${title}\n${content.slice(0, 1500)}`;

  // 1. Explicit semantic version e.g., v1.2.3, v2.5, 1.05.2, v2026.1
  const semverMatch = title.match(/\b[vV]?(\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9.]+)?)\b/);
  if (semverMatch) {
    const raw = semverMatch[1];
    return raw.startsWith("v") || raw.startsWith("V") ? `v${raw.slice(1)}` : `v${raw}`;
  }

  // 2. Named patches: "Patch 1.05", "Update 3.2", "Hotfix 4", "Season 7"
  const namedMatch = title.match(/\b(Patch|Hotfix|Update|Season|시즌|패치|업데이트)\s*#?\s*(\d+(?:\.\d+)*)\b/i);
  if (namedMatch) {
    const type = namedMatch[1];
    const isKorean = /시즌|패치|업데이트/.test(type);
    const prefix = isKorean
      ? type
      : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return `${prefix} ${namedMatch[2]}`;
  }

  // 3. Look in content for explicit version header
  const contentSemver = content.slice(0, 1000).match(/\b(?:Version|Ver\.?|Build|Patch)\s*[:#-]?\s*v?(\d+\.\d+(?:\.\d+)?)\b/i);
  if (contentSemver) {
    return `v${contentSemver[1]}`;
  }

  // 4. Steam build number e.g., Build 1420581
  const buildMatch = combined.match(/\bBuild\s*#?\s*(\d{5,})\b/i);
  if (buildMatch) {
    return `Build ${buildMatch[1]}`;
  }

  // 5. Date-based version e.g. 2026.10.24 or 2026-10-24
  const dateMatch = title.match(/\b(20\d\d)[.\-\/](\d{1,2})[.\-\/](\d{1,2})\b/);
  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2].padStart(2, "0");
    const d = dateMatch[3].padStart(2, "0");
    return `v${y}.${m}.${d}`;
  }

  // 6. Reliable fallback: use releaseDate formatted as vYYYY.MM.DD
  if (releaseDate && !isNaN(releaseDate.getTime())) {
    const y = releaseDate.getFullYear();
    const m = String(releaseDate.getMonth() + 1).padStart(2, "0");
    const d = String(releaseDate.getDate()).padStart(2, "0");
    return `v${y}.${m}.${d}`;
  }

  const now = new Date();
  return `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Patch Type Classifier
 */
export function classifyUpdateType(title: string, content: string): string {
  const combined = (title + " " + content.slice(0, 500)).toLowerCase();
  if (combined.includes("hotfix") || combined.includes("긴급") || combined.includes("emergency")) {
    return "HOTFIX";
  }
  if (combined.includes("major") || combined.includes("season") || combined.includes("시즌") || combined.includes("대규모")) {
    return "MAJOR";
  }
  if (combined.includes("maintenance") || combined.includes("점검") || combined.includes("공지") || combined.includes("notice")) {
    return "NOTICE";
  }
  if (combined.includes("balance") || combined.includes("patch") || combined.includes("패치") || combined.includes("밸런스")) {
    return "PATCH";
  }
  return "MINOR";
}

/**
 * DeepL Full Text Translation Helper
 */
async function translateIfNeeded(title: string, text: string): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey || !text) return null;

  try {
    // Translate up to 8,000 characters for full text support
    const targetText = text.slice(0, 8000);
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [targetText],
        target_lang: "KO",
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.translations?.[0]?.text || null;
    }
  } catch (err) {
    console.warn("DeepL translation notice:", err);
  }
  return null;
}

/**
 * Fetch official Steam store details (banner, website, developer, tags)
 */
async function fetchSteamStoreDetails(appId: number) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=korean&cc=KR`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const appData = json?.[appId]?.data;
    if (!appData) return null;

    return {
      headerImage: appData.header_image || null, // Banner image
      capsuleImage: appData.capsule_image || null, // Icon / Logo
      website: appData.website || null, // Official website
      developers: appData.developers || [],
      publishers: appData.publishers || [],
      description: appData.short_description || "",
      genres: (appData.genres || []).map((g: any) => g.description),
    };
  } catch (err) {
    return null;
  }
}

/**
 * Search Steam AppID by game name if not registered
 */
async function searchSteamAppId(gameName: string): Promise<number | null> {
  try {
    const cleanName = gameName.replace(/\(.*?\)/g, "").trim();
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanName)}&l=english&cc=US`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.items && data.items.length > 0) {
      return data.items[0].id;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Expanded Global & Domestic Core Game Matrix (25+ titles)
 */
const DEFAULT_GLOBAL_TARGETS = [
  { appId: 730, slug: "cs2", name: "카운터 스트라이크 2 (Counter-Strike 2)" },
  { appId: 1172470, slug: "apex-legends", name: "에이펙스 레전드 (Apex Legends)" },
  { appId: 1091500, slug: "cyberpunk-2077", name: "사이버펑크 2077 (Cyberpunk 2077)" },
  { appId: 105600, slug: "terraria", name: "테라리아 (Terraria)" },
  { appId: 578080, slug: "pubg-battlegrounds", name: "배틀그라운드 (PUBG: BATTLEGROUNDS)" },
  { appId: 1086940, slug: "baldurs-gate-3", name: "발더스 게이트 3 (Baldur's Gate 3)" },
  { appId: 570, slug: "dota-2", name: "도타 2 (Dota 2)" },
  { appId: 1623730, slug: "palworld", name: "팰월드 (Palworld)" },
  { appId: 2358720, slug: "black-myth-wukong", name: "검은 신화: 오공 (Black Myth: Wukong)" },
  { appId: 1245620, slug: "elden-ring", name: "엘든 링 (ELDEN RING)" },
  { appId: 553850, slug: "helldivers-2", name: "헬다이버즈 2 (HELLDIVERS 2)" },
  { appId: 252490, slug: "rust", name: "러스트 (Rust)" },
  { appId: 271590, slug: "gta-v", name: "GTA V (Grand Theft Auto V)" },
  { appId: 413150, slug: "stardew-valley", name: "스타듀 밸리 (Stardew Valley)" },
  { appId: 1145360, slug: "hades", name: "하데스 (Hades)" },
  { appId: 1145350, slug: "hades-ii", name: "하데스 II (Hades II)" },
  { appId: 1938090, slug: "call-of-duty", name: "콜 오브 듀티 (Call of Duty)" },
  { appId: 230410, slug: "warframe", name: "워프레임 (Warframe)" },
  { appId: 892970, slug: "valheim", name: "발하임 (Valheim)" },
  { appId: 1172620, slug: "sea-of-thieves", name: "씨 오브 시브즈 (Sea of Thieves)" },
];

/**
 * Enterprise Automated Data Collection Engine
 */
export async function runDataCollection(source: string = "AUTO_MULTI_SOURCE"): Promise<CollectorResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] 멀티플랫폼 공식 게임 데이터 자동 수집 파이프라인 가동 (소스: ${source})`);

  const job = await prisma.dataCollectionJob.create({
    data: {
      source,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  let itemsFound = 0;
  let itemsAdded = 0;
  let itemsSkipped = 0;
  const collectedGames: { gameName: string; version: string; title: string; updateType: string }[] = [];

  try {
    // 1. Get Platforms
    const platforms = await prisma.platform.findMany();
    const platformMap = new Map(platforms.map((p) => [p.key.toLowerCase(), p]));
    const windowsPlatform = platformMap.get("windows") || platforms[0];

    if (!windowsPlatform) {
      throw new Error("기본 플랫폼(Windows)이 DB에 존재하지 않습니다.");
    }

    // 2. Load ALL Existing Games from DB to prevent limitation to only 7 games!
    const dbGames = await prisma.game.findMany({
      where: { status: "ACTIVE" },
      include: {
        platforms: true,
      },
    });

    logs.push(`[DB 연동] 데이터베이스에 등록된 활성 게임 ${dbGames.length}개 로드 완료.`);

    // 3. Build unified targets matrix: Default Targets + All Custom DB Games
    const targetsToProcess: {
      appId: number;
      slug: string;
      canonicalName: string;
      existingGameId?: string;
    }[] = [];

    const processedSlugs = new Set<string>();

    // Add DB games first
    for (const g of dbGames) {
      processedSlugs.add(g.slug);
      let resolvedAppId: number | null = null;

      // Extract AppID from officialWebsiteUrl if it points to steam
      const match = g.officialWebsiteUrl?.match(/\/app\/(\d+)/);
      if (match) {
        resolvedAppId = parseInt(match[1], 10);
      } else {
        // Match from default matrix
        const found = DEFAULT_GLOBAL_TARGETS.find(
          (t) => t.slug === g.slug || t.name.toLowerCase().includes(g.canonicalName.toLowerCase())
        );
        if (found) {
          resolvedAppId = found.appId;
        } else {
          // Dynamic search on Steam
          resolvedAppId = await searchSteamAppId(g.canonicalName);
        }
      }

      if (resolvedAppId) {
        targetsToProcess.push({
          appId: resolvedAppId,
          slug: g.slug,
          canonicalName: g.canonicalName,
          existingGameId: g.id,
        });
      }
    }

    // Add remaining default catalog games not yet in DB
    for (const def of DEFAULT_GLOBAL_TARGETS) {
      if (!processedSlugs.has(def.slug)) {
        targetsToProcess.push({
          appId: def.appId,
          slug: def.slug,
          canonicalName: def.name,
        });
        processedSlugs.add(def.slug);
      }
    }

    logs.push(`[수집 대상 확장] 총 ${targetsToProcess.length}개 게임(DB 등록 게임 및 메이저 타이틀 전체) 순회 시작...`);

    // 4. Iterate over all target games safely (Fail-safe per game)
    for (const target of targetsToProcess) {
      try {
        logs.push(`[${target.canonicalName}] Steam 공식 패치 피드 및 스토어 메타데이터 조회 중 (AppID: ${target.appId})...`);

        // Fetch official Steam Store details for Banner (coverImageUrl) and Official Website
        const storeDetails = await fetchSteamStoreDetails(target.appId);

        // Ensure Game in Database
        let game = target.existingGameId
          ? await prisma.game.findUnique({ where: { id: target.existingGameId } })
          : await prisma.game.findUnique({ where: { slug: target.slug } });

        const bannerUrl = storeDetails?.headerImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${target.appId}/header.jpg`;
        const logoUrl = storeDetails?.capsuleImage || bannerUrl;
        const officialWebsite = storeDetails?.website || `https://store.steampowered.com/app/${target.appId}`;
        const devName = storeDetails?.developers?.join(", ") || "공식 개발사";
        const pubName = storeDetails?.publishers?.join(", ") || devName;
        const genres = storeDetails?.genres?.length ? storeDetails.genres : ["액션", "멀티플레이어"];

        if (!game) {
          game = await prisma.game.create({
            data: {
              slug: target.slug,
              canonicalName: target.canonicalName,
              description: storeDetails?.description || `${target.canonicalName}의 공식 실시간 패치노트와 버전 정보입니다.`,
              developer: devName,
              publisher: pubName,
              iconUrl: logoUrl,
              coverImageUrl: bannerUrl, // Official Banner Image
              officialWebsiteUrl: officialWebsite, // Official Website Link
              genres: genres,
              status: "ACTIVE",
            },
          });
          logs.push(`[신규 등록] '${target.canonicalName}' 배너(${bannerUrl}) 및 공식 웹사이트(${officialWebsite}) 등록 완료.`);
        } else {
          // Update game banner / website if missing
          const needsUpdate = !game.coverImageUrl || !game.officialWebsiteUrl;
          if (needsUpdate) {
            game = await prisma.game.update({
              where: { id: game.id },
              data: {
                coverImageUrl: game.coverImageUrl || bannerUrl,
                officialWebsiteUrl: game.officialWebsiteUrl || officialWebsite,
              },
            });
          }
        }

        // Ensure GamePlatform relation
        let gamePlatform = await prisma.gamePlatform.findUnique({
          where: {
            gameId_platformId: {
              gameId: game.id,
              platformId: windowsPlatform.id,
            },
          },
        });

        if (!gamePlatform) {
          gamePlatform = await prisma.gamePlatform.create({
            data: {
              gameId: game.id,
              platformId: windowsPlatform.id,
              availabilityStatus: "AVAILABLE",
              lastCheckedAt: new Date(),
            },
          });
        }

        // Fetch Official Steam Community News
        const feedUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${target.appId}&count=6&maxlength=8000&format=json&feeds=steam_community_announcements`;
        const res = await fetch(feedUrl, {
          headers: {
            "User-Agent": "NextUps-DataCollector/2.0 (+https://www.nextups.xyz)",
          },
          signal: AbortSignal.timeout(7000),
        });

        if (!res.ok) {
          logs.push(`[스킵] ${target.canonicalName} API 응답 코드: ${res.status}`);
          continue;
        }

        const data = await res.json();
        const newsItems = data?.appnews?.newsitems || [];
        itemsFound += newsItems.length;

        for (const item of newsItems) {
          const rawTitle = item.title?.trim() || "공식 업데이트";
          const rawContent = item.contents || "";
          const sourceUrl = item.url || `https://store.steampowered.com/news/app/${target.appId}/view/${item.gid}`;
          const releaseDate = item.date ? new Date(item.date * 1000) : new Date();

          // Ignore foreign Cyrillic spam
          if (/[а-яА-ЯёЁ]/.test(rawTitle)) {
            continue;
          }

          // Deduplication check
          const existingUpdate = await prisma.update.findFirst({
            where: {
              gameId: game.id,
              platformId: windowsPlatform.id,
              OR: [{ sourceUrl: sourceUrl }, { title: rawTitle }],
            },
          });

          if (existingUpdate) {
            itemsSkipped++;
            continue;
          }

          // Format clean markdown with images and lists aligned
          const bodyMarkdown = convertToMarkdown(rawContent);
          const version = extractVersion(rawTitle, bodyMarkdown, releaseDate);
          const updateType = classifyUpdateType(rawTitle, bodyMarkdown);
          const summary =
            bodyMarkdown.split("\n\n").find((p) => p.trim() && !p.startsWith("#") && !p.startsWith("!"))?.slice(0, 280) ||
            `${game.canonicalName} 공식 최신 패치노트입니다.`;

          // Create new update
          const newUpdate = await prisma.update.create({
            data: {
              gameId: game.id,
              platformId: windowsPlatform.id,
              gamePlatformId: gamePlatform.id,
              version,
              title: rawTitle,
              releaseDate,
              summary,
              bodyMarkdown,
              updateType,
              isVerified: true,
              sourceUrl,
              sourceName: "Steam 공식 패치노트",
              images: bannerUrl ? [bannerUrl] : [],
            },
          });

          // Update Latest Known Version with actual real version string (never generic text)
          await prisma.gamePlatform.update({
            where: { id: gamePlatform.id },
            data: {
              latestKnownVersion: version,
              lastCheckedAt: new Date(),
            },
          });

          itemsAdded++;
          collectedGames.push({
            gameName: game.canonicalName,
            version,
            title: rawTitle,
            updateType,
          });

          logs.push(`[패치 적재] [${game.canonicalName}] ${version} - '${rawTitle}'`);

          // Full-text translation if non-Korean
          const isKorean = /[가-힣]/.test(rawTitle);
          if (!isKorean) {
            const translatedContent = await translateIfNeeded(rawTitle, bodyMarkdown);
            if (translatedContent) {
              await prisma.updateTranslation.create({
                data: {
                  updateId: newUpdate.id,
                  language: "ko",
                  title: rawTitle,
                  summary: summary,
                  bodyMarkdown: translatedContent,
                  translatedBy: "AI_DEEPL",
                },
              }).catch(() => {});
            }
          }

          // User notifications
          const followers = await prisma.gameFollow.findMany({
            where: { gameId: game.id },
            select: { userId: true },
          });

          if (followers.length > 0) {
            await prisma.notification.createMany({
              data: followers.map((f) => ({
                userId: f.userId,
                gameId: game.id,
                updateId: newUpdate.id,
                title: `[새 패치] ${game.canonicalName} ${version}`,
                message: `'${rawTitle}' 패치노트가 공식 등록되었습니다.`,
              })),
            }).catch(() => {});
          }

          // Discord Webhook (Link transmission mode)
          await logToDiscord({
            action: "UPDATE_CREATE",
            title: `[신규 패치 감지] ${game.canonicalName} (${version})`,
            description: `**${rawTitle}**\n${summary}`,
            color: 0x06b6d4,
            details: {
              game: game.canonicalName,
              version,
              updateType,
              sourceUrl,
              updateId: newUpdate.id,
            },
          }).catch(() => {});
        }
      } catch (gameErr: any) {
        logs.push(`[수집 오류 방어] [${target.canonicalName}] 에러 발생했으나 다음 게임으로 안전하게 계속 진행: ${gameErr.message}`);
      }
    }

    const durationMs = Date.now() - startTime;
    logs.push(
      `[작업 완료] 총 소요: ${(durationMs / 1000).toFixed(2)}초, 탐색: ${itemsFound}건, 신규 등록: ${itemsAdded}건, 중복 제외: ${itemsSkipped}건`
    );

    invalidateGamesCache();

    await prisma.dataCollectionJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        itemsFound,
        itemsAdded,
        itemsSkipped,
        completedAt: new Date(),
        logs,
      },
    });

    return {
      jobId: job.id,
      source,
      itemsFound,
      itemsAdded,
      itemsSkipped,
      durationMs,
      logs,
      collectedGames,
    };
  } catch (fatalError: any) {
    logs.push(`[치명적 오류] ${fatalError.message}`);
    await prisma.dataCollectionJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: fatalError.message,
        completedAt: new Date(),
        logs,
      },
    }).catch(() => {});

    return {
      jobId: job.id,
      source,
      itemsFound,
      itemsAdded,
      itemsSkipped,
      durationMs: Date.now() - startTime,
      logs,
      collectedGames,
    };
  }
}
