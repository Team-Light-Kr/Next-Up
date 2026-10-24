import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ShieldAlert, ShieldCheck, ArrowLeft, Clock, User, Globe, FileCode, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminLogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AdminLogPageProps) {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  let logTitle = "NextUps 보안 감사 시스템 로그";
  let logAction = "SYSTEM_AUDIT";
  try {
    const l = await prisma.adminAuditLog.findUnique({
      where: { id },
      select: { title: true, action: true },
    });
    if (l?.title) logTitle = l.title;
    if (l?.action) logAction = l.action;
  } catch {
    // ignore
  }

  const embedJson = JSON.stringify({
    version: 2,
    accent_color: "#2563eb",
    components: [
      {
        type: "container",
        components: [
          {
            type: "section",
            components: [
              {
                type: "text_display",
                content: `NextUps 보안 감사 • ${logAction}\n# [NextUps 로그] ${logTitle}\n보안 감사 로그가 안전하게 기록되었습니다. (관리자 전용)`,
              },
              {
                type: "thumbnail",
                media: {
                  url: `${appUrl}/logo.png`,
                },
              },
            ],
          },
          {
            type: "separator",
          },
          {
            type: "action_row",
            components: [
              {
                type: "link_button",
                label: "관리자 로그 상세 확인 ↗",
                url: `${appUrl}/admin/logs/${id}`,
              },
              {
                type: "link_button",
                label: "관리자 대시보드 ↗",
                url: `${appUrl}/admin/dashboard`,
              },
            ],
          },
        ],
      },
    ],
  });

  return {
    title: `[NextUps 로그] ${logTitle}`,
    description: `NextUps 보안 감사 시스템 - ${logTitle}`,
    other: {
      "discord:component-embed": embedJson,
    },
    alternates: {
      types: {
        "application/json+discord-component-embed": `/api/discord-embed/${id}`,
      },
    },
    openGraph: {
      title: `[NextUps 로그] ${logTitle}`,
      description: `NextUps 보안 감사 로그 확인하기`,
      url: `${appUrl}/admin/logs/${id}`,
      images: [`${appUrl}/logo.png`],
    },
  };
}

export default async function AdminLogDetailPage({ params }: AdminLogPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  // Strict Admin Verification (admin@koharu.live or role === "ADMIN")
  const isAdmin =
    currentUser &&
    (currentUser.role === "ADMIN" || currentUser.email === "admin@koharu.live");

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">403 접근 권한 제한</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            이 링크는 NextUps 보안 감사 로그 전용 페이지입니다.<br />
            일반 사용자는 접근할 수 없으며, 인증된 시스템 관리자 계정만 열람할 수 있습니다.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:opacity-90"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch log from database
  let log: any = null;
  try {
    log = await prisma.adminAuditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            profileCode: true,
            role: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
  }

  if (!log) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">로그를 찾을 수 없습니다</h1>
        <p className="text-xs text-slate-500">해당 ID({id})의 감사 로그가 데이터베이스에 존재하지 않습니다.</p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white"
        >
          관리자 대시보드로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 관리자 대시보드로 돌아가기
        </Link>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>보안 검증된 관리자 열람 중</span>
        </div>
      </div>

      {/* Log Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              {log.action}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {log.title || "NextUps 시스템 감사 로그"}
            </h1>
          </div>
          <div className="text-xs text-slate-500 text-right">
            <div>로그 ID</div>
            <div className="font-mono text-slate-800 font-semibold">{log.id}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> 발생 일시
            </div>
            <div className="text-xs font-semibold text-slate-800">
              {new Date(log.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> 작업자 계정
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {log.user ? `${log.user.displayName} (${log.user.email})` : "게스트 / 시스템 프로세스"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> 원격 IP 주소
            </div>
            <div className="text-xs font-mono font-semibold text-slate-800">
              {log.ipAddress || "기록 없음"}
            </div>
          </div>
        </div>

        {/* Detailed JSON Payload */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-blue-600" /> 감사 데이터 상세 페이로드
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
