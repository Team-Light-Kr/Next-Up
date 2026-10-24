import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import UpdateCard from "@/components/UpdateCard";
import GameCard from "@/components/GameCard";
import { CurrentDate } from "@/components/CurrentDate";
import {
  Monitor,
  Smartphone,
  Apple,
  Laptop,
  ArrowRight,
  Plus,
  Gamepad2,
  Clock,
} from "lucide-react";

import { buildHomeEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NextUps - 멀티플랫폼 게임 업데이트 정보 통합 플랫폼",
  description: "Windows, Android, iOS 공식 최신 패치노트와 버전 정보를 실시간으로 확인하세요.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildHomeEmbed()),
  },
  alternates: {
    types: {
      "application/vnd.discord.component-embed+json": "https://www.nextups.xyz/discord-embed.json",
    },
  },
};

export default async function HomePage() {
  let totalGames = 0;
  let totalUpdates = 0;
  let platforms: any[] = [];
  let latestUpdates: any[] = [];
  let recentGames: any[] = [];

  try {
    const [tGames, tUpdates, pForms, lUpdates, rGames] = await Promise.all([
      prisma.game.count(),
      prisma.update.count(),
      prisma.platform.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.update.findMany({
        take: 6,
        orderBy: { releaseDate: "desc" },
        include: {
          game: {
            select: {
              slug: true,
              canonicalName: true,
              iconUrl: true,
              developer: true,
            },
          },
          platform: {
            select: {
              key: true,
              name: true,
            },
          },
        },
      }),
      prisma.game.findMany({
        take: 4,
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

    totalGames = tGames;
    totalUpdates = tUpdates;
    platforms = pForms;
    latestUpdates = lUpdates;
    recentGames = rGames;
  } catch (error) {
    console.error("HomePage DB query failed gracefully:", error);
  }

  const homeEmbedJson = toComponentEmbedJson(buildHomeEmbed());

  return (
    <div className="space-y-12 pb-16">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: homeEmbedJson,
        }}
      />
      {/* Clean Header / Hero */}
      <section className="border-b border-neutral-200 bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100 text-[11px] text-neutral-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>오늘 기준 실시간 업데이트 현황 · </span>
              <CurrentDate format="full" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              게임 업데이트와 패치 노트
            </h1>
            <p className="text-base text-neutral-600 leading-relaxed">
              Windows, PlayStation, Nintendo Switch, Android, iOS, macOS 플랫폼별 공식 릴리스 버전과 상세 변경 사항을 모아 제공합니다.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Link
                href="/games"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <span>게임 목록 보기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/games/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 게임 등록</span>
              </Link>
            </div>
          </div>

          {/* Simple Metrics */}
          <div className="flex flex-wrap items-center gap-8 pt-8 mt-8 border-t border-neutral-100 text-xs text-neutral-500">
            <div>
              등록 게임 <strong className="font-semibold text-neutral-900">{totalGames}개</strong>
            </div>
            <div className="h-3 w-px bg-neutral-200" />
            <div>
              누적 업데이트 <strong className="font-semibold text-neutral-900">{totalUpdates}건</strong>
            </div>
            <div className="h-3 w-px bg-neutral-200" />
            <div>
              지원 플랫폼 <strong className="font-semibold text-neutral-900">4개 환경</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Platform Quick Links */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            플랫폼 바로가기
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/platforms/windows"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">Windows</div>
                <div className="text-[11px] text-neutral-400">PC / Steam</div>
              </div>
            </Link>

            <Link
              href="/platforms/playstation"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">PlayStation</div>
                <div className="text-[11px] text-neutral-400">PS5 / PS4</div>
              </div>
            </Link>

            <Link
              href="/platforms/nintendo"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">Nintendo</div>
                <div className="text-[11px] text-neutral-400">Switch</div>
              </div>
            </Link>

            <Link
              href="/platforms/android"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">Android</div>
                <div className="text-[11px] text-neutral-400">Google Play</div>
              </div>
            </Link>

            <Link
              href="/platforms/ios"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Apple className="w-4 h-4 text-neutral-800" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">iOS</div>
                <div className="text-[11px] text-neutral-400">App Store</div>
              </div>
            </Link>

            <Link
              href="/platforms/macos"
              className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Laptop className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900">macOS</div>
                <div className="text-[11px] text-neutral-400">Mac App Store</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Latest Updates Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>최신 패치 피드</span>
            </h2>
            <Link href="/games" className="text-xs text-neutral-500 hover:text-neutral-900">
              전체 보기 →
            </Link>
          </div>

          {latestUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestUpdates.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-xl border border-neutral-200 bg-white text-center space-y-3">
              <Clock className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-medium text-neutral-800">
                아직 등록된 패치 소식이 없습니다.
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                게임을 등록하거나 공식 출처에서 새로운 패치 노트를 등록해 보세요.
              </p>
              <div className="pt-1">
                <Link
                  href="/games/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white"
                >
                  <Plus className="w-3.5 h-3.5" /> 게임 등록하기
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Recent Games */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span>최근 등록된 게임</span>
            </h2>
            <Link href="/games" className="text-xs text-neutral-500 hover:text-neutral-900">
              디렉터리 이동 →
            </Link>
          </div>

          {recentGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-xl border border-neutral-200 bg-white text-center space-y-2">
              <Gamepad2 className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-medium text-neutral-800">
                등록된 게임이 없습니다.
              </p>
              <p className="text-xs text-neutral-500">
                첫 번째 게임을 직접 등록해 보세요!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
