import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PlatformBadge from "@/components/PlatformBadge";
import UpdateDetailView from "@/components/UpdateDetailView";
import ReportModal from "@/components/ReportModal";
import {
  Calendar,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  Share2,
  Clock,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface UpdatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdateDetailPage({ params }: UpdatePageProps) {
  const { id } = await params;

  let update: any = null;

  try {
    update = await prisma.update.findUnique({
      where: { id },
      include: {
        game: true,
        platform: true,
        sections: {
          orderBy: { order: "asc" },
        },
        translations: true,
      },
    });
  } catch (error) {
    console.error("UpdateDetailPage query error:", error);
  }

  if (!update) {
    notFound();
  }

  const dateStr = new Date(update.releaseDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/games/${update.game.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{update.game.canonicalName} 상세로 돌아가기</span>
        </Link>

        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          발견 시각: {new Date(update.discoveredAt).toLocaleDateString("ko-KR")}
        </span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        {/* Game Icon & Metadata */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            href={`/games/${update.game.slug}`}
            className="flex items-center gap-3 group"
          >
            {update.game.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={update.game.iconUrl}
                alt={update.game.canonicalName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                {update.game.canonicalName.slice(0, 1)}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {update.game.canonicalName}
              </h2>
              <p className="text-xs text-slate-500">
                {update.game.developer || "공식 개발사"}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <PlatformBadge
              platformKey={update.platform.key}
              name={update.platform.name}
              size="md"
            />
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {update.version}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {update.title}
        </h1>

        {/* Date, Verification & Official Source Link */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              배포일: {dateStr}
            </span>
            {update.isVerified && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>공식 검증 완료</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ReportModal updateId={update.id} targetName={`${update.game.canonicalName} (${update.version})`} />
            {update.sourceUrl && (
              <a
                href={update.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                <span>{update.sourceName || "공식 패치 출처 열기"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sections Summary (if structured sections exist) */}
      {update.sections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {update.sections.map((sec: any) => (
            <div
              key={sec.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
            >
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                {sec.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Detail View with DeepL AI Translation */}
      <UpdateDetailView
        updateId={update.id}
        initialTitle={update.title}
        initialSummary={update.summary}
        initialBody={update.bodyMarkdown}
        initialTranslations={update.translations}
      />
    </div>
  );
}
