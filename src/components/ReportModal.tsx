"use client";

import React, { useState } from "react";
import { AlertTriangle, X, CheckCircle2, Loader2 } from "lucide-react";

interface ReportModalProps {
  gameId?: string;
  updateId?: string;
  targetName: string;
}

export default function ReportModal({ gameId, updateId, targetName }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("INCORRECT_VERSION");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, updateId, reportType, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "제보 접수 중 오류가 발생했습니다.");
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setContent("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>정보 오류 제보</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-xl space-y-4 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>정보 오류 제보하기</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                대상: <strong>{targetName}</strong>
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">
                  제보가 접수되었습니다.
                </p>
                <p className="text-xs text-slate-500">
                  검토 후 신속히 데이터베이스에 반영하겠습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    오류 유형
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
                  >
                    <option value="INCORRECT_VERSION">버전 번호 또는 릴리스 날짜 오류</option>
                    <option value="BROKEN_LINK">공식 출처 링크 깨짐 또는 만료</option>
                    <option value="TYPO">패치노트 내용 오타 또는 번역 오류</option>
                    <option value="OTHER">기타 정보 오류 제보</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    상세 제보 내용
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="올바른 버전 번호, 공식 공지 링크 또는 구체적인 수정 요청 내용을 적어주세요."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>제보 접수</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
