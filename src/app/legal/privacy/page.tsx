import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, Calendar, Lock, Eye, Server } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";
import { buildPrivacyEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const metadata = {
  title: "개인정보 처리방침",
  description: "NextUps 게임 정보 플랫폼의 정식 개인정보 처리방침 전문입니다.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildPrivacyEmbed()),
  },
};

export default function PrivacyPolicyPage() {
  const discordJson = toComponentEmbedJson(buildPrivacyEmbed());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
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
            <ShieldCheck className="w-4 h-4" />
            <span>대한민국 개인정보 보호법 준수</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NextUps 개인정보 처리방침
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium text-blue-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>시행일자: 2026년 10월 25일 | 최종 개정일자: 2026년 10월 25일</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>(시스템 현재 기준일: <CurrentDate format="full" />)</span>
            </div>
          </div>
        </div>

        {/* Highlight Alert */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>비밀번호 일방향 암호화 및 무과금 비영리 운영 방침</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            NextUps는 회원의 비밀번호를 복호화가 불가능한 솔트(Salt) 기반 PBKDF2-SHA512 해시 함수로 암호화하여 저장하며, 운영자를 포함한 그 누구도 회원의 원문 비밀번호를 열람할 수 없습니다. 또한 금융 정보나 주민등록번호 등 민감 정보를 일체 수집하지 않습니다.
          </p>
        </div>

        <div className="prose max-w-none text-xs sm:text-sm text-slate-700 space-y-7 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제1조 (개인정보의 처리 목적)</h2>
            <p>
              Team Light(이하 &quot;운영팀&quot;)는 다음의 목적을 위하여 최소한의 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>회원 가입 및 관리:</strong> 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정 이용 방지, 각종 고지·통지</li>
              <li><strong>보안 감사 및 시스템 보호:</strong> 무단 접근, 불법 침입, 대량 요청 등 사이버 침해 사고 방지를 위한 Discord 보안 감사 웹훅 모니터링</li>
              <li><strong>서비스 제공:</strong> 관심 게임 맞춤형 업데이트 알림 제공, 커뮤니티 의견 및 오류 신고 처리</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제2조 (처리하는 개인정보의 항목)</h2>
            <p>운영팀은 서비스 이용 과정에서 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>필수 수집 항목:</strong> 전자우편(이메일 주소), 닉네임, 암호화된 비밀번호 해시, 8자리 영문 고유 프로필 코드, 계정 생성일시</li>
              <li><strong>선택 수집 항목:</strong> 프로필 아바타 이미지, 자기소개글, 2단계 인증용 휴대전화 번호(SMS 인증 선택 시에 한함)</li>
              <li><strong>자동 생성 항목:</strong> 접속 IP 주소, 쿠키(세션 식별자), 서비스 방문 기록, 불량 이용 기록</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제3조 (개인정보의 처리 및 보유 기간)</h2>
            <p>
              1. 운영팀은 원칙적으로 이용자가 회원 탈퇴를 요청하거나 이용 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.<br />
              2. 단, 부정 가입 방지 및 통신비밀보호법 등 관련 법령의 규정에 의하여 보존할 필요가 있는 경우 다음과 같이 관계 법령에서 정한 일정한 기간 동안 개인정보를 보관합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>계정 로그인 및 서비스 접속 기록: 3개월 (통신비밀보호법)</li>
              <li>오류 신고 및 문의 처리 기록: 1년 (소비자의 불만 또는 분쟁처리에 관한 기록 준용)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제4조 (개인정보의 제3자 제공 및 위탁)</h2>
            <p>
              1. 운영팀은 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의 없이 제3자에게 유상 판매하거나 외부에 임의 제공하지 않습니다.<br />
              2. 서비스의 안정적인 기술적 인프라 및 알림 제공을 위해 다음과 같이 업무를 위탁하고 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
                  <tr>
                    <th className="p-2.5">수탁업체</th>
                    <th className="p-2.5">위탁 업무 내용</th>
                    <th className="p-2.5">보유 및 이용 기간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-medium">Resend Inc.</td>
                    <td className="p-2.5">회원가입/로그인 인증 코드 및 약관 개정 안내 전자우편 발송</td>
                    <td className="p-2.5">발송 완료 시점까지</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">샌드위치 (Sendwich)</td>
                    <td className="p-2.5">2단계 보안 문자메시지(SMS) 전송</td>
                    <td className="p-2.5">발송 완료 시점까지</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Supabase Inc.</td>
                    <td className="p-2.5">암호화된 클라우드 데이터베이스 호스팅</td>
                    <td className="p-2.5">회원 탈퇴 시까지</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제5조 (개인정보의 안전성 확보 조치)</h2>
            <p>운영팀은 회원의 개인정보를 처리함에 있어 분실, 도난, 유출, 변조 또는 훼손되지 않도록 다음과 같은 기술적·관리적 대책을 강구하고 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>비밀번호 일방향 암호화:</strong> Salt 값을 가미한 PBKDF2 해싱으로 원문 확인 불가</li>
              <li><strong>전송 구간 암호화:</strong> HTTPS 및 최신 TLS 1.3 표준 보안 프로토콜 강제 적용</li>
              <li><strong>쿠키 보안:</strong> 세션 토큰에 HttpOnly, Secure, SameSite 속성을 필수 적용하여 스크립트 기반 탈취(XSS/CSRF) 원천 차단</li>
              <li><strong>관리자 권한 통제:</strong> 개인정보 및 감사 로그 열람 권한을 최소화하고 2단계 인증을 거친 승인된 최고 관리자에게만 제한 부여</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">제6조 (개인정보 보호책임자 및 권익침해 구제)</h2>
            <p>회원은 언제든지 계정 설정 메뉴를 통해 자신의 개인정보를 열람, 수정하거나 회원 탈퇴(삭제)를 요구할 수 있습니다.</p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <div className="font-bold text-slate-900">• 개인정보 보호 책임 부서: Team Light 보안위원회</div>
              <div>• 문의 및 불만 처리 공식 이메일: <strong>admin@nextups.xyz</strong></div>
              <div>• 대표 웹사이트: https://www.nextups.xyz</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
