import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import { findUserByPrivacyToken } from "@/lib/privacy-annual-broadcast";
import { buildPrivacyNoticeUserEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const user = await findUserByPrivacyToken(code);
  const card = buildPrivacyNoticeUserEmbed({
    displayName: user?.displayName,
    profileCode: code,
    createdAt: user?.createdAt,
  });
  const embedJson = toComponentEmbedJson(card);

  return {
    title: `회원 전용 개인정보 이용·제공 내역 안내 (${code.slice(0, 6)}***) | NextUps`,
    description: "대한민국 개인정보 보호법 제20조의2에 따른 NextUps 연례 개인정보 이용 및 제공 내역 맞춤 안내입니다.",
    robots: { index: false, follow: false },
    other: {
      "discord:component-embed": embedJson,
    },
  };
}

export default async function PersonalizedPrivacyNoticePage({ params }: PageProps) {
  const { code } = await params;
  const user = await findUserByPrivacyToken(code);

  if (!user) {
    notFound();
  }

  const card = buildPrivacyNoticeUserEmbed({
    displayName: user.displayName,
    profileCode: code,
    createdAt: user.createdAt,
  });
  const discordJson = toComponentEmbedJson(card);

  const todayStr = "2026년 10월 24일";
  const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>메인 화면으로 돌아가기</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 sm:px-10 py-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="NextUps"
              className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-md"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white tracking-wider">
                <Lock className="w-3 h-3 text-emerald-300" />
                보안 난수 인증 전용 열람 페이지
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                NextUps 개인정보 이용·제공 내역 안내
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            「개인정보 보호법」 제20조의2에 따라, 회원님의 소중한 개인정보가 어떤 목적으로 처리되고 안전하게 보호되고 있는지 투명하게 고지합니다.
          </p>
        </div>

        {/* User Identity Verification Box */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  {user.displayName} 회원님 ({maskedEmail})
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  본인 확인 완료
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                통지 기준일: {todayStr} (연 1회 정기 법정 통지)
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[10px] text-slate-400 font-mono block">고유 인증 토큰</span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                {code}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>회원님의 주요 개인정보 처리 현황</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-1/4">구분</th>
                    <th className="py-3 px-4 w-1/2">처리 및 이용 내용</th>
                    <th className="py-3 px-4">상세 근거</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">1. 수집 및 이용 목적</td>
                    <td className="py-3.5 px-4">회원 식별, 로그인 인증, 게임 팔로우 업데이트 알림 발송, 보안 감사</td>
                    <td className="py-3.5 px-4 text-blue-600 font-medium">개인정보처리방침 제1조</td>
                  </tr>
                  <tr className="bg-slate-50/30 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">2. 수집 항목</td>
                    <td className="py-3.5 px-4">이메일 주소, 닉네임, 암호화된 비밀번호(PBKDF2), 프로필 정보, 접속 IP</td>
                    <td className="py-3.5 px-4 text-blue-600 font-medium">개인정보처리방침 제3조</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">3. 제3자 제공 현황</td>
                    <td className="py-3.5 px-4">원칙적으로 제3자 제공 없음 (법령에 따른 의무 제출 요구 시 예외)</td>
                    <td className="py-3.5 px-4 text-blue-600 font-medium">개인정보처리방침 제5조</td>
                  </tr>
                  <tr className="bg-slate-50/30 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">4. 처리 위탁 현황</td>
                    <td className="py-3.5 px-4 leading-relaxed">
                      • 데이터베이스 인프라: Supabase Inc.<br />
                      • 시스템 이메일 인증 발송: Resend Inc.<br />
                      • 2단계 문자 인증 발송: Sendwich (휴대폰 2FA 이용자에 한함)<br />
                      • 패치노트 다국어 기계번역: DeepL SE
                    </td>
                    <td className="py-3.5 px-4 text-blue-600 font-medium">개인정보처리방침 제4조</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200 space-y-2">
            <p>
              NextUps는 앞으로도 회원 여러분의 소중한 개인정보를 안전하게 보호하고 관리하기 위해 최선을 다하겠습니다.<br />
              감사합니다.
            </p>
          </div>

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
