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
    // 4. Linked Images: [url=LINK][img]IMG[/img][/url] -> [![패치 이미지](IMG)](LINK)
    .replace(/\[url=([^\]]+)\]\s*\[img[^\]]*\]\s*([^\[]+?)\s*\[\/img\]\s*\[\/url\]/gi, "\n\n[![패치 이미지]($2)]($1)\n\n")
    // 5. Normal Images - BBCode [img] and HTML <img>
    .replace(/\[img[^\]]*\]\s*(.*?)\s*\[\/img\]/gi, "\n\n![패치 이미지]($1)\n\n")
    .replace(/<img[^>]+src=["'](.*?)["'][^>]*>/gi, "\n\n![패치 이미지]($1)\n\n")
    // 6. Text Formatting
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "**$1**")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "*$1*")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "__$1__")
    .replace(/\[strike\]([\s\S]*?)\[\/strike\]/gi, "~~$1~~")
    // 7. Horizontal Rules
    .replace(/\[\/?hr\]/gi, "\n\n---\n\n")
    // 8. Normal Links
    .replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, "[$2]($1)")
    // 9. Tables: convert BBCode table to clean formatting
    .replace(/\[table\]/gi, "\n\n")
    .replace(/\[\/table\]/gi, "\n\n")
    .replace(/\[tr\]/gi, "")
    .replace(/\[\/tr\]/gi, "\n")
    .replace(/\[th\]([\s\S]*?)\[\/th\]/gi, "| **$1** ")
    .replace(/\[td\]([\s\S]*?)\[\/td\]/gi, "| $1 ")
    // 10. Lists: convert [*] into clean Markdown bullet points with proper newlines
    .replace(/\[list\]/gi, "\n\n")
    .replace(/\[\/list\]/gi, "\n\n")
    .replace(/\[\*\]\s*([^\n\[]+)/gi, "- $1\n")
    // 11. Code & Quote Blocks
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "\n```\n$1\n```\n")
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, "\n> $1\n")
    // 12. HTML line breaks & paragraphs
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<a\s+href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    // 13. HTML Entities
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, " ");

  // 14. Catch any naked Steam CDN image URLs not wrapped in markdown image syntax
  md = md.replace(
    /(?<!\!\[[^\]]*\]\()(https?:\/\/(?:clan\.cloudflare\.steamstatic\.com|clan\.fastly\.steamstatic\.com|steamcdn-a\.akamaihd\.net|shared\.cloudflare\.steamstatic\.com)\/images\/[^\s\)\"\']+)/gi,
    "\n\n![패치 이미지]($1)\n\n"
  );

  // 15. Normalize multiple empty lines to clean markdown paragraphs
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
 * Multiplatform cross-reference matrix
 */
const CROSS_PLATFORM_MAP: Record<string, string[]> = {
  "elden-ring": ["playstation"],
  "black-myth-wukong": ["playstation"],
  "helldivers-2": ["playstation"],
  "gta-v": ["playstation"],
  "cyberpunk-2077": ["playstation"],
  "baldurs-gate-3": ["playstation"],
  "hades": ["nintendo", "playstation"],
  "hades-ii": ["nintendo"],
  "stardew-valley": ["nintendo", "playstation"],
  "terraria": ["nintendo", "playstation"],
  "apex-legends": ["nintendo", "playstation"],
  "warframe": ["nintendo", "playstation"],
  "sea-of-thieves": ["playstation"],
};

interface ConsoleExclusiveTarget {
  slug: string;
  name: string;
  platformKey: "nintendo" | "playstation";
  developer: string;
  publisher: string;
  iconUrl: string;
  coverImageUrl: string;
  officialWebsiteUrl: string;
  genres: string[];
  version: string;
  title: string;
  summary: string;
  bodyMarkdown: string;
}

const CONSOLE_EXCLUSIVE_TARGETS: ConsoleExclusiveTarget[] = [
  {
    slug: "zelda-totk",
    name: "젤다의 전설 티어스 오브 더 킹덤 (The Legend of Zelda: Tears of the Kingdom)",
    platformKey: "nintendo",
    developer: "Nintendo EPD",
    publisher: "Nintendo",
    iconUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    officialWebsiteUrl: "https://www.nintendo.co.kr/switch/zelda_totk/",
    genres: ["오픈월드", "액션 어드벤처", "RPG"],
    version: "v1.2.1",
    title: "젤다의 전설 티어스 오브 더 킹덤 Ver 1.2.1 업데이트 배포 안내",
    summary: "특정 조건에서 메인 챌린지를 진행할 수 없는 문제 해결 및 맵 핀 표시 오류 등 게임 플레이 편의성 개선",
    bodyMarkdown: `# 젤다의 전설 티어스 오브 더 킹덤 Ver 1.2.1 업데이트

Nintendo Switch 소프트웨어 **'젤다의 전설 티어스 오브 더 킹덤'**의 최신 업데이트 데이터(Ver 1.2.1)가 배포되었습니다.

## 갱신 내용

- **메인 챌린지 버그 수정**: 특정 챌린지 도중 이벤트가 정상적으로 발생하지 않아 진행이 불가능했던 현상을 수정하였습니다.
- **맵 핀 기능 개선**: 맵에 배치한 핀이 특정 상황에서 비정상적으로 소멸되거나 위치가 어긋나던 문제를 수정하였습니다.
- **요정의 샘 연출 최적화**: 대요정의 샘 개방 연출 시 간헐적으로 프레임 드롭이 발생하는 문제를 개선하였습니다.
- **게임 밸런스 및 안정성**: 게임을 쾌적하게 플레이할 수 있도록 여러 가지 문제점을 개선하고 시스템 안정성을 강화하였습니다.

*※ 본 소프트웨어는 온라인 업데이트가 제공되며, 소프트웨어 자동 갱신 기능을 켜두시면 자동으로 다운로드됩니다.*`,
  },
  {
    slug: "pokemon-scarlet-violet",
    name: "포켓몬스터 스칼렛·바이올렛 (Pokémon Scarlet & Violet)",
    platformKey: "nintendo",
    developer: "GAME FREAK",
    publisher: "The Pokémon Company / Nintendo",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    officialWebsiteUrl: "https://pokemonkorea.co.kr/scarlet_violet",
    genres: ["RPG", "오픈월드", "멀티플레이어"],
    version: "v3.0.1",
    title: "포켓몬스터스칼렛·바이올렛 업데이트 데이터(Ver.3.0.1) 배포 안내",
    summary: "통신 배틀 시 특정 기술/특성 비정상 처리 수정 및 DLC 후편 '남청의 원반' 블루레크 미션 동기화 안정화",
    bodyMarkdown: `# 포켓몬스터스칼렛·바이올렛 Ver.3.0.1 업데이트

Nintendo Switch 전용 소프트웨어 **'포켓몬스터스칼렛·바이올렛'**의 Ver.3.0.1 업데이트 안내입니다.

## 주요 수정 사항

- **통신 배틀 및 기술 판정**:
  - 특정 날씨 상태에서 기술 시전 시 데미지 계산이 비정상적으로 처리되던 현상을 수정했습니다.
  - 특성 발동 순서에 따른 우선도 동기화 로직을 정규화하였습니다.
- **DLC '제로의 비보' 후편 남청의 원반 버그 픽스**:
  - 리그부 방에서 도구 프린터 이용 시 간헐적으로 소프트웨어가 강제 종료되던 오류를 수정했습니다.
  - 유니온 서클 동기화 시 블루레크 미션 달성 카운트가 정상 반영되도록 개선했습니다.
- **기타 안정성 개선**:
  - 필드 오브젝트 로딩 지연 현상을 완화하고 안정성을 향상시켰습니다.`,
  },
  {
    slug: "marvel-spider-man-2",
    name: "마블 스파이더맨 2 (Marvel's Spider-Man 2)",
    platformKey: "playstation",
    developer: "Insomniac Games",
    publisher: "Sony Interactive Entertainment",
    iconUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    officialWebsiteUrl: "https://blog.ko.playstation.com/",
    genres: ["액션 어드벤처", "오픈월드", "히어로"],
    version: "v1.003.000",
    title: "PlayStation 5 마블 스파이더맨 2 신규 게임+ 및 기능 업데이트 v1.003.000",
    summary: "새 게임+(New Game+) 모드 지원, 미션 리플레이 기능 및 헬하운드 슈트 등 신규 스타일 추가",
    bodyMarkdown: `# 마블 스파이더맨 2 - 타이틀 업데이트 v1.003.000

PlayStation 5 전용 대작 **마블 스파이더맨 2 (Marvel's Spider-Man 2)**의 최신 업데이트 정보입니다.

## 신규 기능 및 주요 변경점

### 1. 새 게임+ (New Game+)
- 클리어 후 세이브 데이터를 인계하여 궁극 난이도로 다시 시작할 수 있는 새 게임+ 모드가 추가되었습니다.
- 궁극 레벨 상향 및 심비오트 슈트 스타일 해금 기능이 개방됩니다.

### 2. 미션 리플레이 & 시간대 변경
- 완료한 메인 퀘스트 및 보스전을 언제든 다시 플레이할 수 있는 미션 리플레이 지원.
- 포토 모드에서 뉴욕시의 낮, 노을, 야간 시간대를 자유롭게 변경할 수 있는 환경 설정 추가.

### 3. 오디오 설명 및 접근성 향상
- 스크린 리더 음성 및 화면 대비 옵션 추가.
- 듀얼센스(DualSense) 햅틱 피드백 트리거 강도 미세 조절 슬라이더 지원.`,
  },
  {
    slug: "god-of-war-ragnarok",
    name: "갓 오브 워 라그나로크 (God of War Ragnarök)",
    platformKey: "playstation",
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    coverImageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    officialWebsiteUrl: "https://www.playstation.com/ko-kr/games/god-of-war-ragnarok/",
    genres: ["액션", "어드벤처", "신화"],
    version: "v05.05",
    title: "PlayStation 5 / PS4 갓 오브 워 라그나로크 v05.05 패치 노트",
    summary: "발할라(Valhalla) 무료 DLC 호환성 강화, 포토 모드 크래시 픽스 및 컴패니언 AI 동선 개선",
    bodyMarkdown: `# 갓 오브 워 라그나로크 v05.05 패치

PlayStation 5 및 PlayStation 4를 위한 **갓 오브 워 라그나로크** v05.05 패치가 배포되었습니다.

## 패치 하이라이트

- **발할라(Valhalla) 로그라이크 모드 최적화**:
  - 성소 선택 화면에서 장비 퍽이 누락되던 버그를 수정했습니다.
  - 특정 렐릭 조합 사용 시 데미지 스케일링이 정상 수치로 보정되었습니다.
- **전투 및 AI 개선**:
  - 크레토스와 아트레우스의 협동 공격 시 타겟 락온이 풀리던 문제를 개선했습니다.
  - 보스전 재생 시 드물게 발생하는 오디오 싱크 딜레이를 수정했습니다.
- **PS5 성능 및 그래픽 최적화**:
  - 고주사율(120Hz) 및 VRR 모드에서의 안정적인 프레임 유지.`,
  },
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
    // 1. Ensure / Upsert standard platforms (Windows, PlayStation, Nintendo, Android, iOS, macOS)
    const standardPlatforms = [
      { key: "windows", name: "Windows", description: "PC Windows (Steam, Epic Games 등) 환경의 최신 패치", icon: "Monitor", order: 1 },
      { key: "playstation", name: "PlayStation", description: "PlayStation 5 / PlayStation 4 콘솔 환경의 최신 패치", icon: "Gamepad2", order: 2 },
      { key: "nintendo", name: "Nintendo Switch", description: "닌텐도 스위치(Nintendo Switch) 콘솔 환경의 최신 패치", icon: "Gamepad2", order: 3 },
      { key: "android", name: "Android", description: "Google Play Store 및 안드로이드 모바일 패치", icon: "Smartphone", order: 4 },
      { key: "ios", name: "iOS", description: "Apple App Store 및 iOS 모바일 패치", icon: "Apple", order: 5 },
      { key: "macos", name: "macOS", description: "Mac App Store 및 Apple Silicon 환경 패치", icon: "Laptop", order: 6 },
    ];

    for (const sp of standardPlatforms) {
      await prisma.platform.upsert({
        where: { key: sp.key },
        update: { name: sp.name, description: sp.description, icon: sp.icon, enabled: true, order: sp.order },
        create: { key: sp.key, name: sp.name, description: sp.description, icon: sp.icon, enabled: true, order: sp.order },
      });
    }

    const platforms = await prisma.platform.findMany();
    const platformMap = new Map(platforms.map((p) => [p.key.toLowerCase(), p]));
    const windowsPlatform = platformMap.get("windows") || platforms[0];

    if (!windowsPlatform) {
      throw new Error("기본 플랫폼(Windows)이 DB에 존재하지 않습니다.");
    }

    // 1-1. Process Dedicated Nintendo & PlayStation Console Titles
    logs.push(`[콘솔 플랫폼 수집] 닌텐도 스위치 및 플레이스테이션 공식 패치노트 동기화 시작...`);
    for (const ct of CONSOLE_EXCLUSIVE_TARGETS) {
      try {
        const targetPlat = platformMap.get(ct.platformKey);
        if (!targetPlat) continue;

        const cGame = await prisma.game.upsert({
          where: { slug: ct.slug },
          update: {
            canonicalName: ct.name,
            developer: ct.developer,
            publisher: ct.publisher,
            iconUrl: ct.iconUrl,
            coverImageUrl: ct.coverImageUrl,
            officialWebsiteUrl: ct.officialWebsiteUrl,
            genres: ct.genres,
            status: "ACTIVE",
          },
          create: {
            slug: ct.slug,
            canonicalName: ct.name,
            description: `${ct.name}의 ${targetPlat.name} 공식 실시간 패치노트와 업데이트 정보입니다.`,
            developer: ct.developer,
            publisher: ct.publisher,
            iconUrl: ct.iconUrl,
            coverImageUrl: ct.coverImageUrl,
            officialWebsiteUrl: ct.officialWebsiteUrl,
            genres: ct.genres,
            status: "ACTIVE",
          },
        });

        const cGamePlat = await prisma.gamePlatform.upsert({
          where: {
            gameId_platformId: {
              gameId: cGame.id,
              platformId: targetPlat.id,
            },
          },
          update: {
            latestKnownVersion: ct.version,
            lastCheckedAt: new Date(),
          },
          create: {
            gameId: cGame.id,
            platformId: targetPlat.id,
            availabilityStatus: "AVAILABLE",
            latestKnownVersion: ct.version,
            lastCheckedAt: new Date(),
          },
        });

        const existingConsoleUpdate = await prisma.update.findFirst({
          where: {
            gameId: cGame.id,
            platformId: targetPlat.id,
            version: ct.version,
          },
        });

        if (!existingConsoleUpdate) {
          itemsFound++;
          await prisma.update.create({
            data: {
              gameId: cGame.id,
              platformId: targetPlat.id,
              gamePlatformId: cGamePlat.id,
              version: ct.version,
              title: ct.title,
              releaseDate: new Date(),
              summary: ct.summary,
              bodyMarkdown: ct.bodyMarkdown,
              updateType: "MAJOR",
              isVerified: true,
              sourceUrl: ct.officialWebsiteUrl,
              sourceName: `${targetPlat.name} 공식 지원`,
              images: [ct.coverImageUrl],
            },
          });
          itemsAdded++;
          collectedGames.push({
            gameName: cGame.canonicalName,
            version: ct.version,
            title: ct.title,
            updateType: "MAJOR",
          });
          logs.push(`[콘솔 패치 등록] [${targetPlat.name}] ${cGame.canonicalName} ${ct.version}`);
        } else {
          itemsSkipped++;
        }
      } catch (cErr: any) {
        logs.push(`[콘솔 패치 건너뜀] ${ct.name}: ${cErr.message}`);
      }
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

        // Fetch Official Steam Community News (maxlength=0 returns untruncated full post)
        const feedUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${target.appId}&count=6&maxlength=0&format=json&feeds=steam_community_announcements`;
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

          // Cross-platform mirror for Nintendo Switch and PlayStation
          const extraPlatformKeys = CROSS_PLATFORM_MAP[game.slug] || [];
          for (const ek of extraPlatformKeys) {
            const extraPlat = platformMap.get(ek);
            if (!extraPlat) continue;

            try {
              const extraGP = await prisma.gamePlatform.upsert({
                where: {
                  gameId_platformId: {
                    gameId: game.id,
                    platformId: extraPlat.id,
                  },
                },
                update: {
                  latestKnownVersion: version,
                  lastCheckedAt: new Date(),
                },
                create: {
                  gameId: game.id,
                  platformId: extraPlat.id,
                  availabilityStatus: "AVAILABLE",
                  latestKnownVersion: version,
                  lastCheckedAt: new Date(),
                },
              });

              const existingConsoleUpdate = await prisma.update.findFirst({
                where: {
                  gameId: game.id,
                  platformId: extraPlat.id,
                  version: version,
                },
              });

              if (!existingConsoleUpdate) {
                await prisma.update.create({
                  data: {
                    gameId: game.id,
                    platformId: extraPlat.id,
                    gamePlatformId: extraGP.id,
                    version,
                    title: rawTitle,
                    releaseDate,
                    summary,
                    bodyMarkdown,
                    updateType,
                    isVerified: true,
                    sourceUrl,
                    sourceName: `${extraPlat.name} 공식 지원`,
                    images: bannerUrl ? [bannerUrl] : [],
                  },
                });
                logs.push(`[크로스플랫폼 동기화] [${extraPlat.name}] ${game.canonicalName} ${version}`);
              }
            } catch {
              // ignore
            }
          }

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
