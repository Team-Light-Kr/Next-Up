import React from "react";
import Link from "next/link";
import { FileText, ChevronLeft, Calendar } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export const metadata = {
  title: "서비스 이용약관 | NextUps",
  description: "NextUps 서비스의 이용약관 안내입니다.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>홈으로 돌아가기</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <FileText className="w-4 h-4" />
            <span>표준 약관 및 법적 규정 준수</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            NextUps 서비스 이용약관
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>시행일자: 2026년 10월 31일 | 최종 개정일자: 2026년 10월 31일</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>(현재 시스템 기준일: <CurrentDate format="full" />)</span>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 Team Light(이하 &quot;운영팀&quot;)가 제공하는 게임 업데이트 정보 플랫폼 &quot;NextUps&quot;(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 운영팀 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              제2조 (무료 공공 서비스 원칙)
            </h2>
            <p>
              본 서비스는 게이머의 정보 탐색 편의를 위한 100% 비영리 무료 공공 서비스로서, 모든 이용자에게 일체의 유료 과금, 광고 게재 또는 프리미엄 멤버십 없이 무료로 핵심 기능을 제공합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              제3조 (약관의 효력 및 7일 사전 공지 원칙)
            </h2>
            <p>
              1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 공시함으로써 효력을 발생합니다.
            </p>
            <p className="font-semibold text-blue-700 dark:text-blue-400">
              2. 대한민국 법령에 의거하여 본 약관을 개정할 경우, 개정 약관의 적용일자 및 개정 사유를 명시하여 적용일자 7일 전부터 웹사이트 공지사항 또는 등록된 회원 전자우편을 통해 사전에 공지합니다. 이용자에게 불리한 변경의 경우에는 최소 30일 이상의 사전 유예기간을 둡니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              제4조 (지식재산권의 존중)
            </h2>
            <p>
              서비스 내에 수록된 각 게임의 상표, 로고, 캐릭터 이미지, 원문 패치 노트의 지식재산권은 해당 게임 개발사 및 퍼블리셔에 귀속됩니다. 서비스는 원문 출처 링크와 합법적인 요약본을 제공함으로써 원저작권자의 권리를 적극 존중합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              제5조 (면책 조항)
            </h2>
            <p>
              운영팀은 공식 출처를 바탕으로 신속하고 정확한 정보를 제공하기 위해 최선을 다하나, 외부 게임 개발사의 갑작스러운 일정 변경, 서버 점검 연장, 긴급 롤백 등에 따른 정보 지연에 대해서는 고의 또는 중과실이 없는 한 법적 책임을 부담하지 않습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
