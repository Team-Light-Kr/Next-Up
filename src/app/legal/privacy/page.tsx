import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, Calendar } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export const metadata = {
  title: "개인정보 처리방침 | NextUps",
  description: "NextUps 서비스의 개인정보 처리방침 안내입니다.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>대한민국 개인정보 보호법 준수</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            NextUps 개인정보 처리방침
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

        <div className="prose max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제1조 (총칙 및 목적)
            </h2>
            <p>
              Team Light(이하 &quot;운영팀&quot;)는 &quot;NextUps&quot; 서비스(이하 &quot;서비스&quot;)를 이용하는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하며, 정보주체의 개인정보를 적법하고 안전하게 처리합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제2조 (처리하는 개인정보의 항목)
            </h2>
            <p>
              서비스는 회원가입, 맞춤형 알림 서비스 제공을 위해 최소한의 정보만을 처리하며, 영리 목적의 마케팅 정보는 일체 수집하지 않습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>회원 가입 및 식별:</strong> 이메일 주소, 닉네임, 프로필 코드, 접속 일시</li>
              <li><strong>2단계 인증 설정 시 (선택):</strong> 휴대전화 번호 (SMS 인증 선택 시), 2단계 인증 설정 수단</li>
              <li><strong>서비스 이용 과정에서 자동 생성되는 정보:</strong> 접속 IP 주소, 브라우저 종류, 쿠키, 서비스 이용 기록</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제3조 (개인정보의 처리 및 보유 기간)
            </h2>
            <p>
              운영팀은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 수집 시에 동의받은 보유·이용 기간 내에서 개인정보를 처리하고 보유합니다. 이용자가 회원 탈퇴를 요청하는 경우 즉시 지체 없이 파기합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제4조 (개인정보의 제3자 제공 및 위탁)
            </h2>
            <p>
              운영팀은 이용자의 사전 동의 없이 개인정보를 제3자에게 유상 판매하거나 외부에 제공하지 않습니다. 원활한 이메일 인증 발송을 위해 전문 클라우드 전송 서비스(Resend Inc.), 문자 인증을 위해 샌드위치(Sendwich)를 이용하며, 해당 수탁자는 인증 목적 외 개인정보를 이용하지 않습니다.
            </p>
          </section>

          <section className="space-y-2 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
            <h2 className="text-lg font-bold text-blue-900">
              제5조 (정책 변경에 대한 7일 사전 공지 의무)
            </h2>
            <p className="text-slate-700 font-medium">
              대한민국 법령 및 관련 규정에 의거하여, 본 개인정보 처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 서비스 메인 페이지의 공지사항 및 등록된 회원 이메일을 통해 개정 사유와 개정 내용을 사전 고지합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              제6조 (개인정보 보호책임자 및 고충처리)
            </h2>
            <p>
              개인정보 보호 관련 문의, 불만 처리 및 피해구제 등에 관한 사항은 아래 공식 창구로 문의해 주시기 바랍니다.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 text-xs space-y-1">
              <div>• 책임 부서: Team Light 개인정보 보호팀</div>
              <div>• 공식 문의 이메일: admin@nextups.xyz</div>
              <div>• 대표 도메인: https://nextups.xyz</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
