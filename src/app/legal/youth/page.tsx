import React from "react";
import Link from "next/link";
import { ShieldAlert, ChevronLeft, Calendar } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export const metadata = {
  title: "청소년 보호정책 | NextUps",
  description: "NextUps 서비스의 청소년 보호정책 안내입니다.",
};

export default function YouthProtectionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>홈으로 돌아가기</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>청소년 보호법 준수</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            NextUps 청소년 보호정책
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>시행일자: 2026년 10월 31일</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>(현재 시스템 기준일: <CurrentDate format="full" />)</span>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제1조 (목적)
            </h2>
            <p>
              NextUps는 각종 청소년 유해매체물 및 불법 정보로부터 청소년을 보호하고 청소년이 건전하고 안전하게 게임 정보를 탐색할 수 있는 환경을 조성하기 위해 「청소년 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 근거하여 청소년 보호정책을 시행하고 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제2조 (유해 정보에 대한 청소년 접근 제한 및 관리)
            </h2>
            <p>
              서비스는 공식 패치 노트 및 일반 게임 정보를 다루며, 음란, 폭력, 도박 등 청소년 유해 정보의 게재를 원천적으로 금지합니다. 관리자 및 정보 검증 절차를 통하여 유해 매체물이 노출되지 않도록 지속적인 모니터링을 시행합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제3조 (청소년보호 책임자 지정)
            </h2>
            <p>
              NextUps는 청소년 유해 정보의 차단과 관리를 위하여 전담 청소년보호 책임자를 지정하고 있습니다.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 text-xs space-y-1">
              <div>• 청소년보호 관리 부서: Team Light 운영위원회</div>
              <div>• 문의 및 유해 게시물 신고: admin@nextups.xyz</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
