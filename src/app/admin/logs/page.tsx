import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ShieldAlert, ShieldCheck, ArrowLeft, Clock, User, Globe, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLogsListPage() {
  const currentUser = await getCurrentUser();

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
            관리자 전용 보안 감사 로그 목록입니다. 일반 사용자는 접근할 수 없습니다.
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

  let logs: any[] = [];
  try {
    logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    });
  } catch (err) {
    console.error("Failed to load logs list:", err);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">보안 감사 및 시스템 로그</h1>
          <p className="text-xs text-slate-500 mt-1">
            Discord Webhook 및 데이터베이스에 기록된 최신 이벤트 실시간 조회 (관리자 전용)
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 대시보드
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
              <tr>
                <th className="px-4 py-3">발생 일시</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3">작업자</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3 text-right">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-slate-900">
                    {l.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">
                    {l.user?.email || "시스템/비회원"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {l.ipAddress || "-"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/logs/${l.id}`}
                      className="inline-flex items-center gap-1 font-sans text-blue-600 hover:underline font-semibold"
                    >
                      보기 <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
