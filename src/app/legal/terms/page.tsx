import React from "react";
import Link from "next/link";
import { FileText, ChevronLeft, Calendar, ShieldCheck, Mail } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export const metadata = {
  title: "서비스 이용약관 | NextUps",
  description: "NextUps 게임 정보 플랫폼의 정식 서비스 이용약관 전문입니다.",
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

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <FileText className="w-4 h-4" />
            <span>표준 약관 및 법적 규정 준수</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NextUps 서비스 이용약관
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium text-blue-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>시행일자: 2026년 10월 25일 (정식 출시) | 최종 개정일자: 2026년 10월 25일</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>(시스템 현재 기준일: <CurrentDate format="full" />)</span>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>약관 개정 사전 공지 및 이메일 발송 고지</span>
          </div>
          <p className="text-blue-700 leading-relaxed">
            NextUps는 관계 법령을 준수하며, 본 약관 개정 사항은 가입된 모든 회원의 이메일로 사전 발송 안내되었습니다.
            개정된 약관에 동의하지 않으시는 경우 회원 탈퇴를 요청하실 수 있으며, 별도의 거부 의사를 표시하지 않고 서비스를 계속 이용하실 경우 개정 약관에 동의하신 것으로 간주됩니다.
          </p>
        </div>

        <div className="prose max-w-none text-xs sm:text-sm text-slate-700 space-y-7 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제1조 (목적)</h2>
            <p>
              본 약관은 Team Light(이하 &quot;운영팀&quot;)가 개발 및 운영하는 멀티플랫폼 게임 업데이트 정보 통합 서비스 &quot;NextUps&quot;(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 운영팀 간의 권리, 의무, 책임사항 및 기타 필요한 제반 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제2조 (용어의 정의)</h2>
            <p>본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>&quot;서비스&quot;</strong>라 함은 단말기(PC, 휴대형 단말기 등)에 상관없이 이용자가 이용할 수 있는 NextUps 및 관련 제반 서비스를 의미합니다.</li>
              <li><strong>&quot;회원&quot;</strong>이라 함은 본 약관에 동의하고 이메일 인증 및 비밀번호 등록을 통해 회원 등록을 완료하여 서비스를 이용하는 자를 말합니다.</li>
              <li><strong>&quot;비회원&quot;</strong>이라 함은 회원에 가입하지 않고 운영팀이 제공하는 공개 게임 패치 및 정보를 열람하는 자를 의미합니다.</li>
              <li><strong>&quot;아이디/계정&quot;</strong>이라 함은 회원의 식별과 서비스 이용을 위하여 회원이 지정하고 운영팀이 인증한 이메일 주소 및 8자리 영문 고유 프로필 코드를 말합니다.</li>
              <li><strong>&quot;비밀번호&quot;</strong>라 함은 회원의 동일성 확인 및 개인정보 보호를 위해 회원 자신이 설정하여 운영팀에 암호화 저장된 문자와 숫자의 조합을 말합니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제3조 (약관의 효력 및 개정 절차)</h2>
            <p>
              1. 본 약관은 서비스 웹사이트 초기 화면 또는 연결 화면에 게시함으로써 효력이 발생합니다.<br />
              2. 운영팀은 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.<br />
              3. 운영팀이 약관을 개정할 경우에는 적용일자 및 개정 사유를 명시하여 현행 약관과 함께 서비스 초기 화면에 <strong>적용일자 7일 전</strong>부터 공지하며, 회원에게 불리하거나 중대한 사항의 변경의 경우 최소 <strong>30일 전</strong> 사전 공지 및 등록된 이메일로 개별 고지합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제4조 (회원가입 및 비밀번호 보안 의무)</h2>
            <p>
              1. 회원가입은 이용자가 본 약관 및 개인정보처리방침에 동의한 후, 유효한 이메일 인증과 최소 6자 이상의 비밀번호를 설정하여 신청합니다.<br />
              2. 회원은 자신의 계정 및 비밀번호에 대한 관리 책임을 전적으로 부담하며, 제3자에게 양도, 대여, 유출할 수 없습니다.<br />
              3. 이전에 비밀번호 없이 생성된 레거시 계정의 경우, 보안 정책 변경에 따라 로그인 시 또는 계정 설정 페이지를 통해 필수 비밀번호를 즉시 등록하여야 합니다.<br />
              4. 회원은 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우 즉시 비밀번호를 변경하고 운영팀에 통보하여야 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제5조 (비영리 무료 공공 서비스 제공 원칙)</h2>
            <p>
              1. NextUps는 전 세계 게이머의 정보 접근권 보장 및 패치 정보 탐색 편의를 위해 운영되는 <strong>100% 비영리 무료 공공 서비스</strong>입니다.<br />
              2. 운영팀은 서비스 내 일체의 유료 과금, 유료 멤버십 가입 유도, 무분별한 광고 게재를 하지 않으며 공공의 이익을 위한 중립적인 정보 수집만을 수행합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제6조 (게임 정보 등록 및 회원의 권한)</h2>
            <p>
              1. 정회원으로 로그인한 이용자는 아직 플랫폼에 등재되지 않은 합법적인 신규 게임 정보 및 스토어 링크를 직접 등록 제안할 수 있습니다.<br />
              2. 허위 정보, 음란물, 불법 사설 서버 링크, 악성코드 유포 목적의 URL을 등록한 경우 운영팀은 사전 통보 없이 해당 게시물을 삭제하거나 이용자의 서비스 이용을 영구 정지할 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제7조 (지식재산권의 귀속 및 권리 보호)</h2>
            <p>
              1. 서비스 내에 표시되는 모든 게임의 상표, 로고, 캐릭터 이미지, 원문 패치 내용의 저작권은 해당 원작 개발사 및 공식 퍼블리셔에 온전히 귀속됩니다.<br />
              2. NextUps는 공정 이용(Fair Use) 및 정보 인용 원칙에 입각하여 각 개발사의 공식 공지 원문 링크와 출처를 상시 명시하며, 원권리자의 정당한 삭제 또는 수정 요청이 있을 시 지체 없이 처리합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제8조 (보안 감사 로깅 및 부정 이용 방지)</h2>
            <p>
              운영팀은 계정 도용, 비정상적 트래픽 공격, 데이터 조작 등 사이버 위협을 방지하기 위하여 회원가입, 로그인, 데이터 등록/변경 등 핵심 활동 내역을 보안 감사 로그로 실시간 기록하며, 외부 Discord 보안 웹훅 연동을 통해 24시간 모니터링합니다. 해당 감사 로그 링크는 엄격한 접근 통제하에 운영자(Admin)에게만 제한 열람됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제9조 (면책 조항)</h2>
            <p>
              1. 운영팀은 천재지변, 외부 클라우드 인프라 장애, 게임 개발사의 긴급 롤백이나 일정 연기 등 불가항력으로 인하여 서비스를 제공할 수 없거나 정보가 일시 지연된 경우 책임을 지지 않습니다.<br />
              2. 이용자가 자신의 비밀번호를 소홀히 관리하여 발생한 계정 유출 손해에 대하여 운영팀은 고의 또는 중대한 과실이 없는 한 책임을 부담하지 않습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제10조 (분쟁 해결 및 관할 법원)</h2>
            <p>
              본 약관의 해석 및 서비스 이용과 관련하여 분쟁이 발생할 경우 대한민국 법령을 준거법으로 하며, 운영팀의 본점 소재지를 관할하는 법원을 합의 관할 법원으로 합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
