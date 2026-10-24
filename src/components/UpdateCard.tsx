import React from "react";
import Link from "next/link";
import { ExternalLink, CheckCircle2, ChevronRight, Calendar, Sparkles } from "lucide-react";
import PlatformBadge from "./PlatformBadge";

interface UpdateCardProps {
  update: {
    id: string;
    version: string;
    title: string;
    releaseDate: Date | string;
    summary: string | null;
    updateType: string;
    isVerified: boolean;
    sourceUrl: string | null;
    sourceName: string | null;
    game: {
      slug: string;
      canonicalName: string;
      iconUrl: string | null;
      developer: string | null;
    };
    platform: {
      key: string;
      name: string;
    };
  };
}

export default function UpdateCard({ update }: UpdateCardProps) {
  const dateStr = new Date(update.releaseDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
    MAJOR: { label: "주요 업데이트", bg: "bg-red-50 border-red-200", text: "text-red-700" },
    MINOR: { label: "일반 업데이트", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    PATCH: { label: "패치", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    HOTFIX: { label: "핫픽스", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
    NOTICE: { label: "공지", bg: "bg-slate-50 border-slate-200", text: "text-slate-700" },
  };

  const type = typeConfig[update.updateType] || typeConfig.PATCH;

  return (
    <article className="group bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Game info & Platform Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            href={`/games/${update.game.slug}`}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            {update.game.iconUrl ? (
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={update.game.iconUrl}
                  alt={update.game.canonicalName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                {update.game.canonicalName.slice(0, 2)}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {update.game.canonicalName}
              </h3>
              <p className="text-xs text-slate-500">
                {update.game.developer || "공식 개발사"}
              </p>
            </div>
          </Link>

          <PlatformBadge platformKey={update.platform.key} name={update.platform.name} size="sm" />
        </div>

        {/* Update Title & Version */}
        <div className="mb-2.5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {update.version}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${type.bg} ${type.text}`}>
              {type.label}
            </span>
            {update.isVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>공식 검증</span>
              </span>
            )}
          </div>

          <Link href={`/updates/${update.id}`}>
            <h4 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors break-words">
              {update.title}
            </h4>
          </Link>
        </div>

        {/* Summary */}
        {update.summary && (
          <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap break-words">
            {update.summary}
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
        </div>

        <div className="flex items-center gap-2">
          {update.sourceUrl && (
            <a
              href={update.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              title={update.sourceName || "공식 원문 출처"}
            >
              <span>{update.sourceName || "출처"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <Link
            href={`/updates/${update.id}`}
            className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:translate-x-0.5 transition-transform"
          >
            <span>상세보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
