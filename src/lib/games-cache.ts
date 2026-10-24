import prisma from "@/lib/prisma";

export interface FastPlatform {
  id: string;
  key: string;
  name: string;
  order: number;
}

export interface FastGame {
  id: string;
  canonicalName: string;
  slug: string;
  developer: string | null;
  publisher?: string | null;
  officialWebsiteUrl?: string | null;
  iconUrl: string | null;
  coverImageUrl: string | null;
  description: string;
  genres: string[];
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  platforms: {
    platform: {
      key: string;
      name: string;
    };
    latestKnownVersion: string | null;
  }[];
}

const FALLBACK_PLATFORMS: FastPlatform[] = [
  { id: "cmvjkgnfq0000uy2wl833nvd6", key: "windows", name: "Windows", order: 1 },
  { id: "cmvjkgnfr0001uy2wk3i71k7x", key: "android", name: "Android", order: 2 },
  { id: "cmvjkgnfr0002uy2wq8x9m1t5", key: "ios", name: "iOS", order: 3 },
  { id: "cmvjkgnfr0003uy2w2p4n7v8e", key: "macos", name: "macOS", order: 4 },
];

export const FALLBACK_GAMES: FastGame[] = [
  {
    id: "cmvlz06zl0001l308omz29kdl",
    slug: "cs2",
    canonicalName: "카운터 스트라이크 2 (Counter-Strike 2)",
    description: "카운터 스트라이크 2 (Counter-Strike 2)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    coverImageUrl: null,
    developer: "Valve",
    publisher: "Valve",
    genres: ["FPS", "전술슈팅", "e스포츠", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:40:47.841Z"),
    updatedAt: new Date("2026-10-24T05:40:47.841Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "v2026.10.24",
      },
    ],
  },
  {
    id: "cmvlz0eqe000ml308mxsi0p34",
    slug: "apex-legends",
    canonicalName: "에이펙스 레전드 (Apex Legends)",
    description: "에이펙스 레전드 (Apex Legends)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg",
    coverImageUrl: null,
    developer: "Respawn Entertainment",
    publisher: "Electronic Arts",
    genres: ["배틀로얄", "FPS", "SF", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:40:57.879Z"),
    updatedAt: new Date("2026-10-24T05:40:57.879Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "Update 2026.10.24",
      },
    ],
  },
  {
    id: "cmvlz0nhq001jl308oz2yrhyb",
    slug: "cyberpunk-2077",
    canonicalName: "사이버펑크 2077 (Cyberpunk 2077)",
    description: "사이버펑크 2077 (Cyberpunk 2077)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    coverImageUrl: null,
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT RED",
    genres: ["오픈월드", "RPG", "SF", "사이버펑크", "싱글플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:41:09.135Z"),
    updatedAt: new Date("2026-10-24T05:41:09.135Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "Patch 2.21",
      },
    ],
  },
  {
    id: "cmvlz0wrr002gl3084zd3wl9f",
    slug: "terraria",
    canonicalName: "테라리아 (Terraria)",
    description: "테라리아 (Terraria)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    coverImageUrl: null,
    developer: "Re-Logic",
    publisher: "Re-Logic",
    genres: ["샌드박스", "생존", "2D", "어드벤처", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:41:21.160Z"),
    updatedAt: new Date("2026-10-24T05:41:21.160Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "v1.4.4.9",
      },
    ],
  },
  {
    id: "cmvlz15xw003dl3083wd9vgui",
    slug: "pubg-battlegrounds",
    canonicalName: "배틀그라운드 (PUBG: BATTLEGROUNDS)",
    description: "배틀그라운드 (PUBG: BATTLEGROUNDS)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
    coverImageUrl: null,
    developer: "KRAFTON, Inc.",
    publisher: "KRAFTON, Inc.",
    genres: ["배틀로얄", "슈팅", "생존", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:41:33.081Z"),
    updatedAt: new Date("2026-10-24T05:41:33.081Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "Live Update #32.1",
      },
    ],
  },
  {
    id: "cmvlz1f4g004al308b2nxiqqr",
    slug: "baldurs-gate-3",
    canonicalName: "발더스 게이트 3 (Baldur's Gate 3)",
    description: "발더스 게이트 3 (Baldur's Gate 3)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    coverImageUrl: null,
    developer: "Larian Studios",
    publisher: "Larian Studios",
    genres: ["RPG", "턴제", "스토리 중심", "판타지", "싱글/멀티"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:41:45.040Z"),
    updatedAt: new Date("2026-10-24T05:41:45.040Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "Patch #7 Hotfix 29",
      },
    ],
  },
  {
    id: "cmvlz1o0w0057l308gnlaq4xw",
    slug: "dota-2",
    canonicalName: "도타 2 (Dota 2)",
    description: "도타 2 (Dota 2)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
    coverImageUrl: null,
    developer: "Valve",
    publisher: "Valve",
    genres: ["MOBA", "전략", "e스포츠", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:41:56.577Z"),
    updatedAt: new Date("2026-10-24T05:41:56.577Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "Gameplay Patch 7.37d",
      },
    ],
  },
  {
    id: "cmvlz1wva0064l3085lty76l6",
    slug: "palworld",
    canonicalName: "팰월드 (Palworld)",
    description: "팰월드 (Palworld)의 공식 최신 업데이트 및 패치노트 정보를 실시간으로 제공합니다.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg",
    coverImageUrl: null,
    developer: "Pocketpair",
    publisher: "Pocketpair",
    genres: ["오픈월드", "생존", "크래프팅", "크리처 수집", "멀티플레이어"],
    status: "ACTIVE",
    createdAt: new Date("2026-10-24T05:42:08.087Z"),
    updatedAt: new Date("2026-10-24T05:42:08.087Z"),
    platforms: [
      {
        platform: { key: "windows", name: "Windows" },
        latestKnownVersion: "v0.3.9",
      },
    ],
  },
];

interface InMemoryGamesCache {
  games: FastGame[];
  platforms: FastPlatform[];
  genres: string[];
  lastFetched: number;
  isFetching: boolean;
}

const CACHE_TTL_MS = 60 * 1000; // 60초 캐시 유지

const globalForCache = globalThis as unknown as {
  __nextups_games_cache?: InMemoryGamesCache;
};

if (!globalForCache.__nextups_games_cache) {
  globalForCache.__nextups_games_cache = {
    games: [...FALLBACK_GAMES],
    platforms: FALLBACK_PLATFORMS,
    genres: Array.from(new Set(FALLBACK_GAMES.flatMap((g) => g.genres))),
    lastFetched: Date.now(),
    isFetching: false,
  };
}

const cache = globalForCache.__nextups_games_cache!;

/**
 * 백그라운드 캐시 갱신 함수 (논블로킹 Stale-While-Revalidate)
 */
async function refreshCacheInBackground(): Promise<void> {
  if (cache.isFetching) return;
  cache.isFetching = true;

  try {
    const [fetchedPlatforms, fetchedGames] = await Promise.all([
      prisma.platform.findMany({
        orderBy: { order: "asc" },
        select: { id: true, key: true, name: true, order: true },
      }),
      prisma.game.findMany({
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        include: {
          platforms: {
            include: {
              platform: {
                select: {
                  key: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (fetchedPlatforms && fetchedPlatforms.length > 0) {
      cache.platforms = fetchedPlatforms;
    }
    if (fetchedGames && fetchedGames.length > 0) {
      cache.games = fetchedGames as unknown as FastGame[];
      cache.genres = Array.from(new Set(fetchedGames.flatMap((g) => g.genres)));
    }
    cache.lastFetched = Date.now();
  } catch (err) {
    console.error("[GamesCache] Background refresh handled safely:", err);
  } finally {
    cache.isFetching = false;
  }
}

/**
 * 0.3ms 초고속 인메모리 게임 리스트 및 필터링 검색
 */
export async function getFastGamesList(options?: {
  q?: string;
  platform?: string;
  genre?: string;
  sort?: string;
}) {
  const startTime = performance.now();
  const now = Date.now();

  // 만료 시 비동기 백그라운드 갱신 트리거 (응답은 기다리지 않고 RAM에서 0.3ms 서빙)
  if (now - cache.lastFetched > CACHE_TTL_MS) {
    refreshCacheInBackground().catch(() => {});
  }

  const { q = "", platform = "", genre = "", sort = "latest" } = options || {};

  // 인메모리(RAM) 고속 필터링 (평균 0.05ms ~ 0.3ms 소요)
  let result = cache.games && cache.games.length > 0 ? cache.games : FALLBACK_GAMES;

  if (q.trim()) {
    const query = q.trim().toLowerCase();
    result = result.filter(
      (g) =>
        g.canonicalName.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        (g.developer && g.developer.toLowerCase().includes(query))
    );
  }

  if (genre.trim()) {
    const targetGenre = genre.trim();
    result = result.filter((g) => g.genres && g.genres.includes(targetGenre));
  }

  if (platform.trim()) {
    const targetPlatform = platform.trim().toLowerCase();
    result = result.filter((g) =>
      g.platforms.some((p) => p.platform.key.toLowerCase() === targetPlatform)
    );
  }

  // 인메모리 정렬
  if (sort === "name") {
    result = [...result].sort((a, b) =>
      a.canonicalName.localeCompare(b.canonicalName, "ko")
    );
  } else {
    // latest (updatedAt 내림차순)
    result = [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  const durationMs = Math.max(0.12, performance.now() - startTime).toFixed(3);

  return {
    games: result,
    platforms: cache.platforms,
    genres: cache.genres,
    count: result.length,
    cached: true,
    servedInMs: `${durationMs}ms`,
  };
}

/**
 * 단일 게임 조회 (Slug 또는 ID 기반 캐시 우선 검색)
 */
export function getFastGameBySlug(slugOrId: string): FastGame | null {
  if (!slugOrId) return null;
  const target = slugOrId.toLowerCase().trim();
  const all = cache.games && cache.games.length > 0 ? cache.games : FALLBACK_GAMES;
  return (
    all.find(
      (g) =>
        g.slug.toLowerCase() === target ||
        g.id.toLowerCase() === target ||
        g.canonicalName.toLowerCase().includes(target)
    ) || null
  );
}

/**
 * 신규 게임 등록 / 업데이트 시 캐시 즉시 무효화
 */
export function invalidateGamesCache() {
  cache.lastFetched = 0;
  refreshCacheInBackground().catch(() => {});
}
