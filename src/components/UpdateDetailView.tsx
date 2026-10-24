"use client";

import React, { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Sparkles, Languages, Check, Loader2, ExternalLink, FileText, Globe } from "lucide-react";

interface UpdateDetailViewProps {
  updateId: string;
  initialTitle: string;
  initialSummary: string | null;
  initialBody: string;
  sourceUrl?: string | null;
  sourceName?: string | null;
  initialTranslations: {
    language: string;
    title: string;
    summary: string | null;
    bodyMarkdown: string;
  }[];
}

export default function UpdateDetailView({
  updateId,
  initialTitle,
  initialSummary,
  initialBody,
  sourceUrl,
  sourceName,
  initialTranslations,
}: UpdateDetailViewProps) {
  // Mode: "ko" (번역본) or "raw" (원문 전체)
  const [viewMode, setViewMode] = useState<"translated" | "original">(() => {
    // If Korean title or no translations yet, default to original
    return initialTranslations.length > 0 ? "translated" : "original";
  });

  const [translations, setTranslations] = useState<Record<string, { title: string; summary: string | null; body: string }>>(() => {
    const map: Record<string, { title: string; summary: string | null; body: string }> = {};
    for (const t of initialTranslations) {
      map[t.language] = { title: t.title, summary: t.summary, body: t.bodyMarkdown };
    }
    return map;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Content to display based on viewMode
  const hasKoTranslation = !!translations.ko;
  const displayTitle = viewMode === "translated" && translations.ko ? translations.ko.title : initialTitle;
  const displaySummary = viewMode === "translated" && translations.ko ? translations.ko.summary : initialSummary;
  const displayBody = viewMode === "translated" && translations.ko ? translations.ko.body : initialBody;

  const handleRequestTranslate = async () => {
    if (translations.ko) {
      setViewMode("translated");
      setStatusMsg("한국어 번역본으로 전환되었습니다.");
      return;
    }

    setIsLoading(true);
    setStatusMsg("DeepL AI로 전체 본문 한국어 번역 중...");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId, targetLang: "ko" }),
      });

      if (!res.ok) {
        throw new Error("번역 서버 응답 실패");
      }

      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        ko: {
          title: data.title,
          summary: data.summary,
          body: data.bodyMarkdown,
        },
      }));
      setViewMode("translated");
      setStatusMsg("전체 한국어 번역이 완료되었습니다.");
    } catch (err) {
      console.error(err);
      setStatusMsg("번역 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Switching Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        {/* Toggle Mode: Translated vs Original */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-slate-600" /> 본문 보기:
          </span>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => {
                if (hasKoTranslation) {
                  setViewMode("translated");
                  setStatusMsg(null);
                } else {
                  handleRequestTranslate();
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "translated"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>한국어 번역본 전체보기</span>
              {hasKoTranslation && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            <button
              onClick={() => {
                setViewMode("original");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "original"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>원문 전체보기 (Original)</span>
            </button>
          </div>
        </div>

        {/* Action Controls & External Link */}
        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="text-xs text-slate-500 font-medium animate-fade-in">
              {statusMsg}
            </span>
          )}

          {!hasKoTranslation && viewMode === "original" && (
            <button
              onClick={handleRequestTranslate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>전체 본문 한국어 번역</span>
            </button>
          )}

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <span>{sourceName || "공식 원본글 열기"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content Box with Clean Typography & Markdown Rendering */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold mb-3 border bg-slate-50 text-slate-700 border-slate-200">
            {viewMode === "translated" ? (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>한국어 번역 전체 본문</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>개발사 공식 원문 전체 본문</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {displayTitle}
          </h2>
        </div>

        {displaySummary && (
          <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-blue-500 text-slate-700 text-xs sm:text-sm leading-relaxed">
            {displaySummary}
          </div>
        )}

        {/* Clean, Aligned Markdown Renderer */}
        <div className="pt-2">
          <MarkdownRenderer content={displayBody} />
        </div>
      </div>
    </div>
  );
}
