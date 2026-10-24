import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로 이동</span>
          </Link>
          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>게임 검색하기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
