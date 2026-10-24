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
} from "lucide-react";
import { buildPlatformEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PlatformPageProps) {
  const { platform } = await params;
  const platformKey = platform.toLowerCase();
  const meta = KNOWN_PLATFORMS[platformKey];
  const name = meta ? meta.name : platform;
  const desc = meta ? meta.description : "NextUps 플랫폼별 패치 정보 허브";

  return {
    title: `${name} 게임 업데이트 정보`,
    description: desc,
    other: {
      "discord:component-embed": toComponentEmbedJson(
        buildPlatformEmbed({ key: platformKey, name, description: desc })
      ),
    },
  };
}

interface PlatformMeta {
  key: string;
  name: string;
  description: string;
}

const KNOWN_PLATFORMS: Record<string, PlatformMeta> = {
  windows: {
    key: "windows",
    name: "Windows",
    description: "PC Windows 환경 (Steam, Epic Games, 전용 런처 등)의 최신 게임 패치 및 버전 정보를 모아봅니다.",
  },
  android: {
    key: "android",
    name: "Android",
    description: "Google Play Store 및 안드로이드 모바일 기기의 최신 게임 패치 및 버전 정보를 모아봅니다.",
  },
  ios: {
    key: "ios",
    name: "iOS",
    description: "Apple App Store (iPhone, iPad) 환경의 최신 게임 패치 및 버전 정보를 모아봅니다.",
  },
  macos: {
    key: "macos",
    name: "macOS",
    description: "Mac App Store 및 Apple Silicon 지원 환경의 최신 게임 패치 및 버전 정보를 모아봅니다.",
  },
  nintendo: {
    key: "nintendo",
    name: "Nintendo Switch",
    description: "닌텐도 스위치(Nintendo Switch) 콘솔 플랫폼의 공식 게임 패치 및 업데이트 정보를 모아봅니다.",
  },
  switch: {
    key: "nintendo",
    name: "Nintendo Switch",
    description: "닌텐도 스위치(Nintendo Switch) 콘솔 플랫폼의 공식 게임 패치 및 업데이트 정보를 모아봅니다.",
  },
  playstation: {
    key: "playstation",
    name: "PlayStation",
    description: "플레이스테이션(PlayStation 5 / PlayStation 4) 콘솔 플랫폼의 공식 게임 패치 및 업데이트 정보를 모아봅니다.",
  },
  ps5: {
    key: "playstation",
    name: "PlayStation 5",
    description: "플레이스테이션 5(PlayStation 5) 전용 및 크로스젠 공식 게임 패치 및 업데이트 정보를 모아봅니다.",
  },
  ps4: {
    key: "playstation",
    name: "PlayStation 4",
    description: "플레이스테이션 4(PlayStation 4) 콘솔의 공식 게임 패치 및 업데이트 정보를 모아봅니다.",
  },
};

interface PlatformPageProps {
  params: Promise<{
    platform: string;
  }>;
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform } = await params;
  const platformKey = platform.toLowerCase();

  const meta = KNOWN_PLATFORMS[platformKey];
  if (!meta) {
    notFound();
  }

  let platformName = meta.name;
  let platformDescription = meta.description;
  let platformUpdates: any[] = [];
  let platformGames: any[] = [];

  try {
    const platformData = await prisma.platform.findUnique({
      where: { key: platformKey },
    });

    if (platformData) {
      platformName = platformData.name || platformName;
      if (platformData.description) {
        platformDescription = platformData.description;
      }

      const [updates, games] = await Promise.all([
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

      platformUpdates = updates;
      platformGames = games;
    }
  } catch (error) {
    console.error(`Error loading platform data for ${platformKey}:`, error);
  }

  const platformIcons: Record<string, React.ReactNode> = {
    windows: <Monitor className="w-8 h-8 text-blue-500" />,
    nintendo: <Gamepad2 className="w-8 h-8 text-red-500" />,
    switch: <Gamepad2 className="w-8 h-8 text-red-500" />,
    playstation: <Gamepad2 className="w-8 h-8 text-indigo-500" />,
    ps5: <Gamepad2 className="w-8 h-8 text-indigo-500" />,
    ps4: <Gamepad2 className="w-8 h-8 text-indigo-500" />,
    android: <Smartphone className="w-8 h-8 text-emerald-500" />,
    ios: <Apple className="w-8 h-8 text-slate-900" />,
    macos: <Laptop className="w-8 h-8 text-purple-500" />,
  };

  const discordJson = toComponentEmbedJson(
    buildPlatformEmbed(
      { key: platformKey, name: platformName, description: platformDescription },
      platformGames.length
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shadow-xs">
            {platformIcons[platformKey] || <Monitor className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PlatformBadge platformKey={platformKey} name={platformName} size="md" />
              <span className="text-xs text-slate-500">전용 패치 허브</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {platformName} 게임 업데이트 정보
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {platformDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div>
            지원 게임: <strong className="text-blue-600">{platformGames.length}개</strong>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            등록 패치: <strong className="text-blue-600">{platformUpdates.length}건</strong>
          </div>
        </div>
      </div>

      {/* Platform Updates Feed */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{platformName} 최신 업데이트 피드</span>
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
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">
              해당 플랫폼에 등록된 최신 패치가 아직 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* Supported Games on this Platform */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <span>{platformName} 지원 게임 목록</span>
          </h2>
          <Link
            href={`/games?platform=${platformKey}`}
            prefetch={true}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            검색 필터로 열기 →
          </Link>
        </div>

        {platformGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">
              해당 플랫폼에 등록된 게임이 아직 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
