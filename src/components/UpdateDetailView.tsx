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
  // Mode: "ko" | "en" | "ja" | "raw"
  const [viewMode, setViewMode] = useState<"ko" | "en" | "ja" | "raw">(() => {
    return initialTranslations.some((t) => t.language === "ko") ? "ko" : "raw";
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
  let displayTitle = initialTitle;
  let displaySummary = initialSummary;
  let displayBody = initialBody;

  if (viewMode !== "raw" && translations[viewMode]) {
    displayTitle = translations[viewMode].title;
    displaySummary = translations[viewMode].summary;
    displayBody = translations[viewMode].body;
  }

  const handleTranslateTo = async (targetLang: "ko" | "en" | "ja") => {
    if (translations[targetLang]) {
      setViewMode(targetLang);
      setStatusMsg(null);
      return;
    }

    setIsLoading(true);
    const langNames: Record<string, string> = { ko: "한국어", en: "영어", ja: "일본어" };
    setStatusMsg(`DeepL AI로 전체 본문 ${langNames[targetLang]} 번역 중...`);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId, targetLang }),
      });

      if (!res.ok) {
        throw new Error("번역 서버 응답 실패");
      }

      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [targetLang]: {
          title: data.title,
          summary: data.summary,
          body: data.bodyMarkdown,
        },
      }));
      setViewMode(targetLang);
      setStatusMsg(`전체 ${langNames[targetLang]} 번역이 완료되었습니다.`);
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
        {/* Toggle Mode: Korean vs English vs Japanese vs Original */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-slate-600" /> 언어 선택:
          </span>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 gap-1 flex-wrap">
            {/* 1. Korean */}
            <button
              onClick={() => handleTranslateTo("ko")}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "ko"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>한국어 (KO)</span>
              {translations.ko && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            {/* 2. English */}
            <button
              onClick={() => handleTranslateTo("en")}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "en"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>English (EN)</span>
              {translations.en && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            {/* 3. Japanese */}
            <button
              onClick={() => handleTranslateTo("ja")}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "ja"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <span>日本語 (JA)</span>
              {translations.ja && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            {/* 4. Original Raw */}
            <button
              onClick={() => {
                setViewMode("raw");
                setStatusMsg(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "raw"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>원문 전체보기 (Original)</span>
            </button>
          </div>
        </div>

        {/* Action Controls & External Link */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {statusMsg}
            </span>
          )}

          {!isLoading && statusMsg && (
            <span className="text-xs text-slate-500 font-medium">
              {statusMsg}
            </span>
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
            {viewMode === "ko" && (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>한국어 번역 전체 본문 (KO)</span>
              </>
            )}
            {viewMode === "en" && (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>English Translated Full Text (EN)</span>
              </>
            )}
            {viewMode === "ja" && (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>日本語 翻訳 全体本文 (JA)</span>
              </>
            )}
            {viewMode === "raw" && (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>개발사 공식 원문 전체 본문 (Original)</span>
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
