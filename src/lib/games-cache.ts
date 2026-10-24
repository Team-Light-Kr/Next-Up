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
  createdAt: Date;
  updatedAt: Date;
  platforms: {
    platform: {
      key: string;
      name: string;
    };
    latestKnownVersion: string | null;
  }[];
}

interface InMemoryGamesCache {
  games: FastGame[];
  platforms: FastPlatform[];
  genres: string[];
  lastFetched: number;
  isFetching: boolean;
}

const FALLBACK_PLATFORMS: FastPlatform[] = [
  { id: "p1", key: "windows", name: "Windows", order: 1 },
  { id: "p2", key: "android", name: "Android", order: 2 },
  { id: "p3", key: "ios", name: "iOS", order: 3 },
  { id: "p4", key: "macos", name: "macOS", order: 4 },
];

const CACHE_TTL_MS = 60 * 1000; // 60초 캐시 유지

const globalForCache = globalThis as unknown as {
  __nextups_games_cache?: InMemoryGamesCache;
};

if (!globalForCache.__nextups_games_cache) {
  globalForCache.__nextups_games_cache = {
    games: [],
    platforms: FALLBACK_PLATFORMS,
    genres: [],
    lastFetched: 0,
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

    if (fetchedPlatforms.length > 0) {
      cache.platforms = fetchedPlatforms;
    }
    cache.games = fetchedGames as unknown as FastGame[];
    cache.genres = Array.from(new Set(fetchedGames.flatMap((g) => g.genres)));
    cache.lastFetched = Date.now();
  } catch (err) {
    console.error("[GamesCache] Background refresh failed gracefully:", err);
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

  // 1. 캐시가 비어있다면 최초 1회만 동기 패칭
  if (cache.games.length === 0 && now - cache.lastFetched > 10000) {
    await refreshCacheInBackground();
  } else if (now - cache.lastFetched > CACHE_TTL_MS) {
    // 만료 시 비동기 백그라운드 갱신 트리거 (응답은 기다리지 않고 기존 메모리에서 0.3ms 서빙)
    refreshCacheInBackground().catch(() => {});
  }

  const { q = "", platform = "", genre = "", sort = "latest" } = options || {};

  // 2. 인메모리(RAM) 고속 필터링 (평균 0.05ms ~ 0.2ms 소요)
  let result = cache.games;

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

  // 3. 인메모리 정렬
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

  const durationMs = (performance.now() - startTime).toFixed(3);

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
 * 신규 게임 등록 / 업데이트 시 캐시 즉시 무효화
 */
export function invalidateGamesCache() {
  cache.lastFetched = 0;
  refreshCacheInBackground().catch(() => {});
}
