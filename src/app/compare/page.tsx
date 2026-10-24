import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { GitCompare, ArrowLeft, ArrowRight, Layers, Clock, Calendar, Gamepad2 } from "lucide-react";
import { buildCompareEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";
import CompareSelector, { UpdateItem } from "@/components/CompareSelector";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "패치 버전 비교 도구 | NextUps",
  description: "서로 다른 두 버전 간의 변경점과 상세 패치 노트를 나란히 비교합니다.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildCompareEmbed()),
  },
  alternates: {
    types: {
      "application/vnd.discord.component-embed+json": "https://www.nextups.xyz/api/discord-embed?path=/compare",
    },
  },
};

interface ComparePageProps {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { left = "", right = "" } = await searchParams;

  const allUpdatesRaw = await prisma.update.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      game: { select: { canonicalName: true, iconUrl: true, slug: true } },
      platform: { select: { name: true } },
    },
    take: 100,
  });

  const updatesForSelector: UpdateItem[] = allUpdatesRaw.map((u) => ({
    id: u.id,
    version: u.version,
    title: u.title,
    releaseDate: u.releaseDate.toISOString(),
    game: {
      canonicalName: u.game.canonicalName,
      iconUrl: u.game.iconUrl,
      slug: u.game.slug,
    },
    platform: {
      name: u.platform.name,
    },
  }));

  const leftUpdate = left
    ? await prisma.update.findUnique({
        where: { id: left },
        include: { game: true, platform: true },
      })
    : null;

  const rightUpdate = right
    ? await prisma.update.findUnique({
        where: { id: right },
        include: { game: true, platform: true },
      })
    : null;

  const discordJson = toComponentEmbedJson(buildCompareEmbed());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>홈으로 돌아가기</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-blue-600" />
          <span>패치 버전 비교 도구</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          서로 다른 두 버전 간의 변경점과 상세 패치 노트를 나란히 비교합니다.
        </p>
      </div>

      {/* Selectors Component */}
      <CompareSelector
        updates={updatesForSelector}
        initialLeftId={left}
        initialRightId={right}
      />

      {/* Comparison Grid */}
      {leftUpdate && rightUpdate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column (이전 버전) */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-blue-600">{leftUpdate.game.canonicalName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">{leftUpdate.platform.name}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-blue-600 font-mono mr-1.5">v{leftUpdate.version}</span>
                <span>{leftUpdate.title}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>배포일: {new Date(leftUpdate.releaseDate).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>

            <div className="text-slate-800">
              <MarkdownRenderer content={leftUpdate.bodyMarkdown || "패치노트 본문이 없습니다."} />
            </div>
          </div>

          {/* Right Column (이후 버전) */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-indigo-600">{rightUpdate.game.canonicalName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">{rightUpdate.platform.name}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-indigo-600 font-mono mr-1.5">v{rightUpdate.version}</span>
                <span>{rightUpdate.title}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>배포일: {new Date(rightUpdate.releaseDate).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>

            <div className="text-slate-800">
              <MarkdownRenderer content={rightUpdate.bodyMarkdown || "패치노트 본문이 없습니다."} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-slate-200 rounded-2xl bg-white shadow-2xs">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">
            비교할 두 개 버전을 상단에서 선택해 주세요.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            게임별로 묶인 드롭다운 목록에서 원하는 이전 버전과 이후 버전을 선택한 뒤 [비교하기]를 누르면 나란히 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
