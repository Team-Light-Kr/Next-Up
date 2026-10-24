"use client";

import React, { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Sparkles, Languages, Check, Loader2, RefreshCw } from "lucide-react";

interface UpdateDetailViewProps {
  updateId: string;
  initialTitle: string;
  initialSummary: string | null;
  initialBody: string;
  initialTranslations: {
    language: string;
    title: string;
    summary: string | null;
    bodyMarkdown: string;
  }[];
}

const LANGUAGES = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "영어 (English)", flag: "🇺🇸" },
  { code: "ja", label: "일본어 (日本語)", flag: "🇯🇵" },
  { code: "zh", label: "중국어 (中文)", flag: "🇨🇳" },
];

export default function UpdateDetailView({
  updateId,
  initialTitle,
  initialSummary,
  initialBody,
  initialTranslations,
}: UpdateDetailViewProps) {
  const [selectedLang, setSelectedLang] = useState("ko");
  const [translations, setTranslations] = useState<Record<string, { title: string; summary: string | null; body: string }>>(() => {
    const map: Record<string, { title: string; summary: string | null; body: string }> = {
      ko: { title: initialTitle, summary: initialSummary, body: initialBody },
    };
    for (const t of initialTranslations) {
      map[t.language] = { title: t.title, summary: t.summary, body: t.bodyMarkdown };
    }
    return map;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentContent = translations[selectedLang] || translations.ko;

  const handleTranslate = async (langCode: string) => {
    if (langCode === "ko") {
      setSelectedLang("ko");
      setStatusMsg("원문(한국어) 표시 중");
      return;
    }

    setSelectedLang(langCode);

    // If already in local memory/cache
    if (translations[langCode]) {
      setStatusMsg("캐시된 번역 데이터 로드됨");
      return;
    }

    setIsLoading(true);
    setStatusMsg("DeepL AI로 번역 중...");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId, targetLang: langCode }),
      });

      if (!res.ok) {
        throw new Error("번역 서버 응답 실패");
      }

      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [langCode]: {
          title: data.title,
          summary: data.summary,
          body: data.bodyMarkdown,
        },
      }));

      setStatusMsg(
        data.source === "database_cache"
          ? "데이터베이스 캐시 번역 로드됨"
          : "DeepL AI 번역 완료 및 DB 저장됨"
      );
    } catch (err) {
      console.error(err);
      setStatusMsg("번역 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Translation Toolbar Header (Right aligned button with blue~sky gradient) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            번역 언어 선택:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleTranslate(lang.code)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label.split(" ")[0]}</span>
                  {translations[lang.code] && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI 번역 버튼 (파란색~하늘색 그라데이션 조금 투명하게) */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {statusMsg && (
            <span className="text-[11px] text-slate-500 animate-fade-in">
              {statusMsg}
            </span>
          )}

          <button
            onClick={() => handleTranslate(selectedLang === "ko" ? "en" : selectedLang)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="선택한 언어로 DeepL 자동 번역"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            <span>번역</span>
          </button>
        </div>
      </div>

      {/* Translated or Original Content Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
          {currentContent.title}
        </h2>

        {currentContent.summary && (
          <div className="p-4 mb-6 rounded-lg bg-blue-50/60 border-l-4 border-blue-500 text-slate-700 text-sm leading-relaxed">
            {currentContent.summary}
          </div>
        )}

        <MarkdownRenderer content={currentContent.body} />
      </div>
    </div>
  );
}
