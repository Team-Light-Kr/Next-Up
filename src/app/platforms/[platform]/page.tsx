import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import UpdateCard from "@/components/UpdateCard";
import GameCard from "@/components/GameCard";
import PlatformBadge from "@/components/PlatformBadge";
import {
  Monitor,
  Smartphone,
  Apple,
  Laptop,
  Clock,
  Gamepad2,
  ExternalLink,
} from "lucide-react";

interface PlatformPageProps {
  params: Promise<{
    platform: string;
  }>;
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform } = await params;
  const platformKey = platform.toLowerCase();

  const platformData = await prisma.platform.findUnique({
    where: { key: platformKey },
  });

  if (!platformData) {
    notFound();
  }

  // Fetch updates specifically for this platform
  const [platformUpdates, platformGames] = await Promise.all([
    prisma.update.findMany({
      where: { platformId: platformData.id },
      orderBy: { releaseDate: "desc" },
      take: 12,
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
      where: {
        platforms: {
          some: { platformId: platformData.id },
        },
      },
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

  const platformIcons: Record<string, React.ReactNode> = {
    windows: <Monitor className="w-8 h-8 text-blue-500" />,
    android: <Smartphone className="w-8 h-8 text-emerald-500" />,
    ios: <Apple className="w-8 h-8 text-slate-900 dark:text-slate-100" />,
    macos: <Laptop className="w-8 h-8 text-purple-500" />,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
            {platformIcons[platformKey] || <Monitor className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PlatformBadge platformKey={platformKey} name={platformData.name} size="md" />
              <span className="text-xs text-slate-500">전용 패치 허브</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {platformData.name} 게임 업데이트 정보
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {platformData.description || `${platformData.name} 환경의 최신 게임 패치 및 버전 정보를 모아봅니다.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            지원 게임: <strong className="text-blue-600 dark:text-blue-400">{platformGames.length}개</strong>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            등록 패치: <strong className="text-blue-600 dark:text-blue-400">{platformUpdates.length}건</strong>
          </div>
        </div>
      </div>

      {/* Platform Updates Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{platformData.name} 최신 업데이트 피드</span>
          </h2>
          <span className="text-xs text-slate-500">
            총 {platformUpdates.length}건
          </span>
        </div>

        {platformUpdates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformUpdates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">
              해당 플랫폼에 등록된 최신 패치가 아직 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* Supported Games on this Platform */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <span>{platformData.name} 지원 게임 목록</span>
          </h2>
          <Link
            href={`/games?platform=${platformKey}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            검색 필터로 열기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
