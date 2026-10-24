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
    summary: u.summary,
    bodyMarkdown: u.bodyMarkdown,
    game: {
      canonicalName: u.game.canonicalName,
      iconUrl: u.game.iconUrl,
      slug: u.game.slug,
    },
    platform: {
      name: u.platform.name,
    },
  }));

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

      {/* Selectors & Comparison View Component */}
      <CompareSelector
        updates={updatesForSelector}
        initialLeftId={left}
        initialRightId={right}
      />
    </div>
  );
}
