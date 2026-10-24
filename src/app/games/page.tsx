import React from "react";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import { Search, Filter, Gamepad2, ArrowUpDown } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildGamesListEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NextUps 게임 디렉터리",
  description: "멀티플랫폼 게임 업데이트 정보 및 패치노트를 실시간으로 탐색하세요.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildGamesListEmbed()),
  },
  alternates: {
    types: {
      "application/vnd.discord.component-embed+json": "https://www.nextups.xyz/api/discord-embed?path=/games",
    },
  },
  openGraph: {
    title: "NextUps 게임 디렉터리",
    description: "멀티플랫폼 게임 업데이트 정보 및 패치노트를 실시간으로 탐색하세요.",
    url: "https://www.nextups.xyz/games",
    images: ["https://www.nextups.xyz/logo.png"],
  },
};

interface GamesPageProps {
  searchParams: Promise<{
    q?: string;
    platform?: string;
    genre?: string;
    sort?: string;
  }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const { q = "", platform = "", genre = "", sort = "latest" } =
    await searchParams;

  // 실시간 DB 직접 조회 (타겟 필드 선별 쿼리로 로딩 속도 극대화)
  const [platforms, allGamesRaw] = await Promise.all([
    prisma.platform.findMany({
      orderBy: { order: "asc" },
      select: { id: true, key: true, name: true, order: true },
    }),
    prisma.game.findMany({
      where: {
        status: "ACTIVE",
        ...(q.trim()
          ? {
              OR: [
                { canonicalName: { contains: q.trim(), mode: "insensitive" } },
                { description: { contains: q.trim(), mode: "insensitive" } },
                { developer: { contains: q.trim(), mode: "insensitive" } },
              ],
            }
          : {}),
        ...(platform.trim()
          ? {
              platforms: {
                some: {
                  platform: {
                    key: platform.trim().toLowerCase(),
                  },
                },
              },
            }
          : {}),
        ...(genre.trim()
          ? {
              genres: {
                has: genre.trim(),
              },
            }
          : {}),
      },
      orderBy:
        sort === "name"
          ? { canonicalName: "asc" }
          : { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        canonicalName: true,
        developer: true,
        description: true,
        iconUrl: true,
        coverImageUrl: true,
        genres: true,
        platforms: {
          select: {
            latestKnownVersion: true,
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

  // 장르 목록 추출 (중복 쿼리 제거하여 로딩 지연 제거)
  const allGenres = Array.from(new Set(allGamesRaw.flatMap((g) => g.genres || [])));

  const discordJson = toComponentEmbedJson(buildGamesListEmbed(allGamesRaw.length));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            <span>게임 탐색 디렉터리</span>
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          현재 {allGamesRaw.length}개의 게임 정보와 플랫폼별 패치 내역을 확인할 수 있습니다.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <form method="GET" action="/games" className="relative">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="게임 이름, 개발사, 키워드로 검색..."
            className="w-full pl-10 pr-24 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          {platform && <input type="hidden" name="platform" value={platform} />}
          {genre && <input type="hidden" name="genre" value={genre} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </form>

        {/* Platform Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 플랫폼:
          </span>
          <Link
            href={`/games?${new URLSearchParams({ ...(q ? { q } : {}), ...(genre ? { genre } : {}), ...(sort ? { sort } : {}) }).toString()}`}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
              !platform
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            전체
          </Link>
          {platforms.map((p) => {
            const isSelected = platform.toLowerCase() === p.key.toLowerCase();
            const params = new URLSearchParams({
              ...(q ? { q } : {}),
              platform: p.key,
              ...(genre ? { genre } : {}),
              ...(sort ? { sort } : {}),
            });
            return (
              <Link
                key={p.id}
                href={`/games?${params.toString()}`}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p.name}
              </Link>
            );
          })}
        </div>

        {/* Genres and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Genre Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">
              장르:
            </span>
            <Link
              href={`/games?${new URLSearchParams({ ...(q ? { q } : {}), ...(platform ? { platform } : {}), ...(sort ? { sort } : {}) }).toString()}`}
              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                !genre
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              전체
            </Link>
            {allGenres.map((g) => {
              const isSelected = genre === g;
              const params = new URLSearchParams({
                ...(q ? { q } : {}),
                ...(platform ? { platform } : {}),
                genre: g,
                ...(sort ? { sort } : {}),
              });
              return (
                <Link
                  key={g}
                  href={`/games?${params.toString()}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {g}
                </Link>
              );
            })}
          </div>

          {/* Sort Switch */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={`/games?${new URLSearchParams({ ...(q ? { q } : {}), ...(platform ? { platform } : {}), ...(genre ? { genre } : {}), sort: "latest" }).toString()}`}
              className={`font-medium ${sort !== "name" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              최신순
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href={`/games?${new URLSearchParams({ ...(q ? { q } : {}), ...(platform ? { platform } : {}), ...(genre ? { genre } : {}), sort: "name" }).toString()}`}
              className={`font-medium ${sort === "name" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              이름순
            </Link>
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      {allGamesRaw.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allGamesRaw.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            조건에 맞는 게임을 찾을 수 없습니다
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            다른 검색어를 입력하시거나 플랫폼 및 장르 필터를 해제해 보세요.
          </p>
          <Link
            href="/games"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            필터 초기화
          </Link>
        </div>
      )}
    </div>
  );
}
