import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, ExternalLink, Calendar, Info } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export const metadata = {
  title: "개인정보 이용·제공 내역 안내 | NextUps",
  description: "대한민국 개인정보 보호법 제20조의2에 따른 NextUps 연례 개인정보 이용 및 제공 내역 안내입니다.",
};

export default function PrivacyAnnualNoticePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>홈으로 돌아가기</span>
      </Link>

      {/* Main Mail-Style Card (Identical to User's Uploaded Screenshots) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Top Sky-blue to Royal-blue Gradient Banner (HoYoverse / Papago+ Style) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-8 sm:p-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>대한민국 개인정보보호법 제20조의2 준수</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            NextUps
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 font-medium">
            멀티플랫폼 게임 업데이트 정보 통합 플랫폼
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-800">
          <div className="border-b border-slate-200 pb-6 space-y-2">
            <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              연 1회 정기 법정 통지
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              NextUps 서비스 개인정보 이용·제공 내역 안내
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                기준일자: 2026년 10월 24일
              </span>
              <span>(현재 시스템 조회일: <CurrentDate format="full" />)</span>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <p>
              안녕하세요, <strong>NextUps</strong> 회원님.<br />
              항상 NextUps 서비스를 이용해 주셔서 진심으로 감사의 말씀을 드립니다.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm space-y-2 text-slate-700">
              <p>
                NextUps는 <strong>「개인정보 보호법」 제20조의2(개인정보의 이용·제공 내역의 통지)</strong>에 따라, 연 1회 회원님의 소중한 개인정보가 어떻게 이용되고 제공·위탁되었는지 투명하게 안내해 드리고 있습니다.
              </p>
              <p className="text-xs text-slate-500">
                본 통지는 이용자 권리 보장을 위해 회원가입 시 등록된 계정 정보를 기준으로 교부되며, 자세한 내용은 개인정보처리방침 전문을 통해 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Table (NEIS+ / Papago+ Style) */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>주요 안내사항</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-1/3">항목 구분</th>
                    <th className="py-3 px-4 w-1/2">처리 및 이용 내용</th>
                    <th className="py-3 px-4">관련 조항 바로가기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      1. 개인정보 수집 및 이용 목적
                    </td>
                    <td className="py-3.5 px-4">
                      회원 식별, 로그인 인증, 게임 팔로우 업데이트 알림 발송, 보안 감사
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href="/legal/privacy"
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        개인정보처리방침 제1조 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/30 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      2. 수집한 개인정보 항목
                    </td>
                    <td className="py-3.5 px-4">
                      이메일 주소, 닉네임, 비밀번호(일방향 PBKDF2 암호화), 프로필 정보, 접속 IP
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href="/legal/privacy"
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        개인정보처리방침 제3조 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      3. 개인정보 제3자 제공 목적 및 항목
                    </td>
                    <td className="py-3.5 px-4">
                      원칙적으로 제3자 제공 없음 (법령에 따른 의무 제출 요구 시 예외)
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href="/legal/privacy"
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        개인정보처리방침 제5조 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/30 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      4. 개인정보 처리 위탁 현황
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed">
                      • 데이터베이스 인프라: Supabase Inc.<br />
                      • 시스템 이메일 인증 발송: Resend Inc.<br />
                      • 2단계 문자 인증 발송: Sendwich (휴대폰 2FA 이용자에 한함)<br />
                      • 패치노트 다국어 기계번역: DeepL SE
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href="/legal/privacy"
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        개인정보처리방침 제4조 <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          <div className="pt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200">
            <p>
              NextUps는 앞으로도 회원 여러분의 소중한 개인정보를 안전하게 보호하고 관리하기 위해 최선을 다하겠습니다.<br />
              감사합니다.
            </p>
          </div>

          {/* Footer Notice Notes (NEIS+ Style Asterisks) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 space-y-1">
            <p>* 본 안내문은 「개인정보 보호법」 제20조의2에 따라 이용자의 권리 보장을 위해 발송·게시되었습니다.</p>
            <p>* 본 통지에 관한 문의는 최고 관리자 전자우편(admin@koharu.live / contact@nextups.xyz)으로 전달해 주시기 바랍니다.</p>
            <p>NextUps • Team Light 법무보호팀</p>
          </div>
        </div>
      </div>
    </div>
  );
}
