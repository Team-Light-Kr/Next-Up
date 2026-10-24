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
  { id: "cmvjkgnfq0004uy2w9z8v1p3a", key: "playstation", name: "PlayStation", order: 2 },
  { id: "cmvjkgnfq0005uy2w4r6x7k2b", key: "nintendo", name: "Nintendo Switch", order: 3 },
  { id: "cmvjkgnfr0001uy2wk3i71k7x", key: "android", name: "Android", order: 4 },
  { id: "cmvjkgnfr0002uy2wq8x9m1t5", key: "ios", name: "iOS", order: 5 },
  { id: "cmvjkgnfr0003uy2w2p4n7v8e", key: "macos", name: "macOS", order: 6 },
];

export const FALLBACK_GAMES: FastGame[] = [];

interface InMemoryGamesCache {
  games: FastGame[];
  platforms: FastPlatform[];
  genres: string[];
  lastFetched: number;
  isFetching: boolean;
}

const CACHE_TTL_MS = 30 * 1000; // 30초 캐시 유지

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

    if (fetchedPlatforms && fetchedPlatforms.length > 0) {
      cache.platforms = fetchedPlatforms;
    }
    cache.games = (fetchedGames || []) as unknown as FastGame[];
    cache.genres = Array.from(new Set(cache.games.flatMap((g) => g.genres || [])));
    cache.lastFetched = Date.now();
  } catch (err) {
    console.error("[GamesCache] Background refresh error:", err);
  } finally {
    cache.isFetching = false;
  }
}

/**
 * 게임 리스트 및 필터링 검색
 */
export async function getFastGamesList(options?: {
  q?: string;
  platform?: string;
  genre?: string;
  sort?: string;
}) {
  const startTime = performance.now();
  const now = Date.now();

  // 최초 로드이거나 만료 시 갱신
  if (now - cache.lastFetched > CACHE_TTL_MS || cache.lastFetched === 0) {
    if (cache.lastFetched === 0) {
      await refreshCacheInBackground();
    } else {
      refreshCacheInBackground().catch(() => {});
    }
  }

  const { q = "", platform = "", genre = "", sort = "latest" } = options || {};

  let result = [...(cache.games || [])];

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

  // 정렬
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
 * 단일 게임 조회
 */
export function getFastGameBySlug(slugOrId: string): FastGame | null {
  if (!slugOrId) return null;
  const target = slugOrId.toLowerCase().trim();
  const all = cache.games || [];
  return (
    all.find(
      (g) =>
        g.slug.toLowerCase() === target ||
        g.id.toLowerCase() === target ||
        g.canonicalName.toLowerCase() === target
    ) || null
  );
}

/**
 * 신규 게임 등록 / 업데이트 / 삭제 시 캐시 즉시 무효화
 */
export function invalidateGamesCache() {
  cache.lastFetched = 0;
  cache.games = [];
  refreshCacheInBackground().catch(() => {});
}
