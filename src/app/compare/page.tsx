import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { GitCompare, ArrowLeft, ArrowRight, Layers, Clock } from "lucide-react";

interface ComparePageProps {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { left = "", right = "" } = await searchParams;

  const allUpdates = await prisma.update.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      game: { select: { canonicalName: true } },
      platform: { select: { name: true } },
    },
    take: 50,
  });

  const leftUpdate = left ? await prisma.update.findUnique({ where: { id: left }, include: { game: true, platform: true } }) : null;
  const rightUpdate = right ? await prisma.update.findUnique({ where: { id: right }, include: { game: true, platform: true } }) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

      {/* Selectors */}
      <form method="GET" action="/compare" className="bg-white p-5 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            비교 대상 A (이전 버전)
          </label>
          <select
            name="left"
            defaultValue={left}
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900"
          >
            <option value="">버전 선택...</option>
            {allUpdates.map((u) => (
              <option key={u.id} value={u.id}>
                {u.game.canonicalName} ({u.platform.name}) - {u.version} ({u.title})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            비교 대상 B (이후 버전)
          </label>
          <div className="flex gap-2">
            <select
              name="right"
              defaultValue={right}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900"
            >
              <option value="">버전 선택...</option>
              {allUpdates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.game.canonicalName} ({u.platform.name}) - {u.version} ({u.title})
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white"
            >
              비교하기
            </button>
          </div>
        </div>
      </form>

      {/* Comparison Grid */}
      {leftUpdate && rightUpdate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-xs text-neutral-500">{leftUpdate.game.canonicalName} • {leftUpdate.platform.name}</span>
              <h2 className="text-lg font-bold text-neutral-900 mt-1">
                {leftUpdate.version}: {leftUpdate.title}
              </h2>
              <span className="text-[11px] text-neutral-400">
                배포일: {new Date(leftUpdate.releaseDate).toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="prose text-xs max-w-none whitespace-pre-wrap leading-relaxed text-neutral-700">
              {leftUpdate.bodyMarkdown}
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-xs text-neutral-500">{rightUpdate.game.canonicalName} • {rightUpdate.platform.name}</span>
              <h2 className="text-lg font-bold text-neutral-900 mt-1">
                {rightUpdate.version}: {rightUpdate.title}
              </h2>
              <span className="text-[11px] text-neutral-400">
                배포일: {new Date(rightUpdate.releaseDate).toLocaleDateString("ko-KR")}
              </span>
            </div>

            <div className="prose text-xs max-w-none whitespace-pre-wrap leading-relaxed text-neutral-700">
              {rightUpdate.bodyMarkdown}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-neutral-200 rounded-xl bg-white">
          <GitCompare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-800">
            비교할 두 개 버전을 상단에서 선택해 주세요.
          </p>
        </div>
      )}
    </div>
  );
}
