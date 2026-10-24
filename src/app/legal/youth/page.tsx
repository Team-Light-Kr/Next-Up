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
              <span>시행일자: 2026년 10월 25일 (정식 출시)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>(현재 시스템 기준일: <CurrentDate format="full" />)</span>
            </div>
          </div>
        </div>

        <div className="prose max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제1조 (목적 및 기본 원칙)
            </h2>
            <p>
              NextUps(이하 "회사" 또는 "플랫폼")는 각종 청소년 유해매체물 및 불법·유해 정보로부터 청소년을 능동적으로 보호하고, 청소년이 유익하고 건전한 인터넷 환경에서 올바른 게임 업데이트 및 패치 정보를 습득할 수 있도록 「청소년 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 근거하여 본 청소년 보호정책을 수립·시행하고 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제2조 (유해 정보에 대한 청소년 접근 제한 및 모니터링)
            </h2>
            <p>
              NextUps는 청소년이 아무런 제약 없이 청소년 유해 매체물에 노출되지 않도록 다음과 같은 기술적·관리적 보호 조치를 강구하고 있습니다:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>성인용 게임 및 청소년이용불가 등급 콘텐츠의 패치노트에 대한 식별 태그 부착 및 경고 안내 문구 표기</li>
              <li>음란성 문구, 폭력적 묘사, 도박 유도 링크, 불법 크랙 사이트 URL 등 유해 키워드에 대한 실시간 필터링 체계 가동</li>
              <li>이용자 제보 시스템 및 24시간 실시간 감사 로깅 체계(Discord Webhook Audit Logs)를 통한 불법 게시물 즉시 차단</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제3조 (유해정보로부터의 청소년보호를 위한 업무담당자 교육)
            </h2>
            <p>
              회사는 청소년 보호 관련 법령 및 유해정보 발견 시 처리 절차에 대한 내부 가이드라인을 수립하여 관리자 및 콘텐츠 운영 담당자를 대상으로 정기적인 교육을 실시하고 있으며, 유해 정보 발견 즉시 비공개 격리 조치할 수 있는 보안 감사 체계를 상시 유지합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제4조 (유해정보로 인한 피해상담 및 고충처리)
            </h2>
            <p>
              NextUps는 청소년 유해매체물 및 부적절한 게시물로 인하여 권리를 침해받거나 피해를 입은 이용자를 위하여 신속한 상담 및 고충 처리 창구를 운영하고 있습니다.
            </p>
            <p className="text-xs text-slate-600">
              신고 및 고충 처리가 접수되는 즉시 담당자는 사안의 중대성을 평가하여 최대 24시간 이내에 게시물 차단, 임시 조치 또는 삭제를 단행하고 신고자에게 처리 경과를 통지합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제5조 (청소년보호 책임자 및 담당자의 지정)
            </h2>
            <p>
              청소년 보호와 관련된 건의사항, 문의사항 또는 불법 유해 정보 제보는 아래의 청소년보호 책임자 및 총괄 관리자에게 언제든지 연락 주시기 바랍니다:
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900">[청소년 보호 총괄 책임자]</div>
              <div>• 성명: NextUps 운영위원회 총괄</div>
              <div>• 소속: Team Light 법무보호팀</div>
              <div>• 최고 관리자 전자우편: admin@koharu.live / contact@nextups.xyz</div>
              <div>• 유해물 긴급 신고: 서비스 내 [정보 오류 및 불법 신고] 기능 상시 가동</div>
            </div>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
            <p>
              부칙: 본 청소년 보호정책은 2026년 10월 25일부터 전면 시행되며, 종전의 정책은 본 정책으로 대체됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
