"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  PlusCircle,
  Loader2,
  Layers,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"collector" | "reports">("collector");
  const [jobs, setJobs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [runningCollector, setRunningCollector] = useState(false);
  const [collectorResult, setCollectorResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reportsRes] = await Promise.all([
        fetch("/api/reports"),
      ]);
      const reportsData = await reportsRes.json();
      setReports(reportsData.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunCollector = async () => {
    setRunningCollector(true);
    setCollectorResult(null);
    try {
      const res = await fetch("/api/admin/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "STEAM_OFFICIAL_FEED" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "수집기 실행 중 오류가 발생했습니다.");
      }
      setCollectorResult(data.result);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRunningCollector(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: "RESOLVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              Admin Only
            </span>
            <span className="text-xs text-slate-400">데이터 수집 및 운영 관리</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            관리자 운영 대시보드
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/games/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>게임 등록</span>
          </Link>
          <Link
            href="/admin/updates/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>패치노트 등록</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("collector")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "collector"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>공식 출처 자동 수집기</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>정보 오류 제보 관리 ({reports.filter((r) => r.status === "PENDING").length})</span>
        </button>
      </div>

      {activeTab === "collector" ? (
        <div className="space-y-6">
          {/* Collector Action Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-blue-600" />
                <span>공식 데이터 실시간 자동 수집기</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Steam Web API 등 공인된 게임 플랫폼의 공식 뉴스 피드를 실시간으로 크롤링하여, 
                버전 중복 검사를 통과한 신규 업데이트를 데이터베이스에 등록하고 팔로워들에게 웹 알림을 발송합니다.
              </p>
            </div>

            <button
              onClick={handleRunCollector}
              disabled={runningCollector}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50 shrink-0"
            >
              {runningCollector ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>지금 수집 실행 (Run Now)</span>
            </button>
          </div>

          {/* Last Run Results */}
          {collectorResult && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>수집 작업 성공 완료</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Job ID: {collectorResult.jobId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-center">
                <div className="p-3 rounded-lg bg-slate-800/60">
                  <div className="text-xl font-bold font-mono text-white">{collectorResult.itemsFound}</div>
                  <div className="text-[11px] text-slate-400">발견된 항목</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60">
                  <div className="text-xl font-bold font-mono text-emerald-400">+{collectorResult.itemsAdded}</div>
                  <div className="text-[11px] text-slate-400">신규 등록됨</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/60">
                  <div className="text-xl font-bold font-mono text-amber-400">{collectorResult.itemsSkipped}</div>
                  <div className="text-[11px] text-slate-400">중복 제외 건수</div>
                </div>
              </div>

              {collectorResult.logs && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-400 mb-1.5">실행 상세 로그:</div>
                  <div className="bg-black/50 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                    {collectorResult.logs.map((log: string, i: number) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Reports Management Tab */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              사용자 정보 오류 제보 목록
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              게이머들이 제보한 버전 오류, 링크 깨짐, 오타 등을 검토하고 처리 상태를 업데이트합니다.
            </p>
          </div>

          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((r) => {
                const dateStr = new Date(r.createdAt).toLocaleDateString("ko-KR");
                return (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {r.reportType}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            r.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : r.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          {r.status === "PENDING" ? "검토 대기중" : r.status === "RESOLVED" ? "처리 완료" : "반려됨"}
                        </span>
                        <span className="text-xs text-slate-400">{dateStr}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {r.content}
                      </p>

                      <div className="text-[11px] text-slate-400">
                        {r.game && <span>관련 게임: <strong>{r.game.canonicalName}</strong> </span>}
                        {r.update && <span>| 업데이트: <strong>{r.update.version}</strong></span>}
                        {r.user && <span>| 제보자: {r.user.displayName}</span>}
                      </div>
                    </div>

                    {r.status === "PENDING" && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleUpdateReportStatus(r.id, "RESOLVED")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> 처리완료
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(r.id, "REJECTED")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> 반려
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              접수된 정보 오류 제보가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
