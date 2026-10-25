"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log error to console safely
    console.error("NextUps runtime error caught by boundary:", error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    startTransition(() => {
      router.refresh();
      reset();
    });
    // 서버 컴포넌트 런타임 캐시 완전 갱신을 위해 window 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            일시적인 문제가 발생했습니다
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            데이터베이스 동기화 중이거나 일시적인 네트워크 지연일 수 있습니다.
            아래 버튼을 눌러 다시 시도해주세요.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "다시 시도하는 중..." : "다시 시도하기"}</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로 이동</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
