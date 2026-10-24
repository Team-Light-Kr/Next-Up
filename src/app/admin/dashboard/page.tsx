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
  Send,
  ShieldAlert,
  History,
  Users,
  Gamepad2,
  ExternalLink,
  Server,
  Zap,
  Globe,
  Mail,
  Smartphone,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"collector" | "email" | "reports" | "audit">("collector");
  const [stats, setStats] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [runningCollector, setRunningCollector] = useState(false);
  const [collectorResult, setCollectorResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Custom email broadcaster states
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    targetType: "ALL",
    customEmail: "",
  });
  const [sendingCustomEmail, setSendingCustomEmail] = useState(false);
  const [customEmailStatus, setCustomEmailStatus] = useState<string | null>(null);

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    setSendingCustomEmail(true);
    setCustomEmailStatus(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "발송 실패");
      setCustomEmailStatus(`이메일 발송 성공! (총 ${data.total}명 중 ${data.successCount}명 성공)`);
      setEmailForm({ subject: "", message: "", targetType: "ALL", customEmail: "" });
    } catch (err: any) {
      alert(err.message || "발송 실패");
    } finally {
      setSendingCustomEmail(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [authRes, statsRes, reportsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/stats"),
        fetch("/api/reports"),
      ]);

      const authData = await authRes.json();
      setCurrentUser(authData.user);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setSystemStatus(statsData.systemStatus);
        setRecentLogs(statsData.recentLogs || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleRunCollector = async () => {
    setRunningCollector(true);
    setCollectorResult(null);
    try {
      const res = await fetch("/api/admin/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "AUTO_MULTI_SOURCE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "수집기 실행 중 오류가 발생했습니다.");
      }
      setCollectorResult(data.result);
      fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin =
    currentUser?.role === "ADMIN" ||
    currentUser?.email === "admin@koharu.live" ||
    currentUser?.email === "admin@nextups.xyz";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-semibold tracking-tight">NextUps 관리자 통제 센터 초기화 중...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">403 Forbidden - 접근 제한</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            이 페이지는 NextUps 시스템 관리자 전용 구역입니다.<br />
            관리자 계정(admin@koharu.live)으로 인증 후 이용해 주시기 바랍니다.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            홈으로 이동
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            관리자 로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
              System Admin Center
            </span>
            <span className="text-xs font-medium text-slate-400">
              최고 관리자: <strong>{currentUser?.displayName}</strong> ({currentUser?.email})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            NextUps 운영 통합 관제 센터
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            실시간 공식 게임 데이터 자동 수집기(Steam Web API/다중 피드), 대한민국 법정 공지(법 제20조의2), 
            Discord Components V2 보안 감사 로그 및 이용자 제보를 원스톱으로 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="새로고침"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>새로고침</span>
          </button>
          <Link
            href="/admin/games/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>신규 게임 등록</span>
          </Link>
          <Link
            href="/admin/updates/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>패치노트 수동 등록</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">추적 게임 수</span>
            <Gamepad2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.totalGames ?? "..."}
          </div>
          <div className="text-[10px] text-slate-400">카탈로그 등록 완료</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">누적 패치노트</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.totalUpdates ?? "..."}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">실시간 검증 완료</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">등록 이용 회원</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.totalUsers ?? "..."}
          </div>
          <div className="text-[10px] text-slate-400">활성 계정 기준</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">미처리 제보</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats?.pendingReports ?? "..."}
          </div>
          <div className="text-[10px] text-slate-400">신속 검토 필요</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">보안 감사 로그</span>
            <History className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.totalAuditLogs ?? "..."}
          </div>
          <div className="text-[10px] text-slate-400">Discord 연동 보관</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">인프라 상태</span>
            <Server className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-emerald-600 pt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>정상 가동 중</span>
          </div>
          <div className="text-[10px] text-slate-400">포트 6543 풀러 가동</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab("collector")}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "collector"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>실시간 데이터 자동 수집 센터</span>
        </button>


        <button
          onClick={() => setActiveTab("email")}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "email"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="w-4 h-4 text-pink-500" />
          <span>회원 맞춤 공지 이메일 발송</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>정보 오류 제보 관리 ({reports.filter((r) => r.status === "PENDING").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>보안 감사 실시간 로그</span>
        </button>
      </div>

      {/* TAB 1: Realtime Auto-Collector Engine */}
      {activeTab === "collector" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                <span>Steam Web API • DeepL AI 번역기 • 실시간 알림 파이프라인</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                멀티플랫폼 공식 출처 실시간 자동 수집기
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                Steam Web API 및 공인 게임 스토어의 공식 패치 채널을 스캔합니다. SemVer 지능형 버전 추출,
                중복 패치 필터링, DeepL 한국어 기계번역, 팔로워 실시간 웹 알림 및 Discord Components V2 웹훅 전송까지 전 과정이 자동으로 수행됩니다.
              </p>
            </div>

            <button
              onClick={handleRunCollector}
              disabled={runningCollector}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0 shadow-md hover:shadow-lg cursor-pointer"
            >
              {runningCollector ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>지금 실시간 수집 실행 (Run Live Collection)</span>
            </button>
          </div>

          {/* Results Summary if Run */}
          {collectorResult && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>수집 파이프라인 실행 완료</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Job ID: {collectorResult.jobId} (소요: {(collectorResult.durationMs / 1000).toFixed(2)}초)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-2xl font-black font-mono text-white">{collectorResult.itemsFound}</div>
                  <div className="text-xs text-slate-400 mt-1">스캔된 공식 패치</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-2xl font-black font-mono text-emerald-400">+{collectorResult.itemsAdded}</div>
                  <div className="text-xs text-slate-400 mt-1">신규 정식 적재</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-2xl font-black font-mono text-amber-400">{collectorResult.itemsSkipped}</div>
                  <div className="text-xs text-slate-400 mt-1">중복 버전 스킵</div>
                </div>
              </div>

              {collectorResult.logs && (
                <div className="pt-2 space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>실행 터미널 실시간 스트림:</span>
                    <span className="text-[10px] text-slate-500 font-mono">{collectorResult.logs.length} lines</span>
                  </div>
                  <div className="bg-black/70 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 max-h-60 overflow-y-auto border border-slate-800 leading-relaxed">
                    {collectorResult.logs.map((log: string, i: number) => (
                      <div key={i} className="hover:text-white transition-colors">{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* TAB: Custom Email Broadcaster */}
      {activeTab === "email" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              <span>회원 맞춤 공지 이메일 발송 센터</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              NextUps 공식 템플릿(로고 헤더, 카드 본문, 버튼 링크, 법정 푸터)을 적용하여 전체 회원 또는 특정 회원에게 맞춤 공지를 발송합니다.
            </p>
          </div>

          {customEmailStatus && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{customEmailStatus}</span>
            </div>
          )}

          <form onSubmit={handleSendCustomEmail} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  수신 대상 선택 *
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={emailForm.targetType === "ALL"}
                      onChange={() => setEmailForm({ ...emailForm, targetType: "ALL" })}
                      className="text-blue-600"
                    />
                    <span>전체 가입 회원 일괄 발송</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={emailForm.targetType === "CUSTOM"}
                      onChange={() => setEmailForm({ ...emailForm, targetType: "CUSTOM" })}
                      className="text-blue-600"
                    />
                    <span>특정 회원 직접 지정</span>
                  </label>
                </div>
              </div>

              {emailForm.targetType === "CUSTOM" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    수신자 이메일 주소 *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={emailForm.customEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, customEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                공지 이메일 제목 *
              </label>
              <input
                type="text"
                required
                placeholder="예: [NextUps] 10월 특별 이벤트 및 시스템 개선 안내"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                공지 상세 본문 설명 * (단락 구분을 위해 빈 줄을 넣을 수 있습니다)
              </label>
              <textarea
                required
                rows={6}
                placeholder="회원들에게 전달할 상세 안내 공지 내용을 작성하세요..."
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                className="w-full p-4 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                발송 시 Resend 공식 연동망을 통해 전송되며 Discord 보안 감사 채널에 통계가 기록됩니다.
              </span>

              <button
                type="submit"
                disabled={sendingCustomEmail}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {sendingCustomEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>이메일 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>공지 이메일 발송하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Reports Management */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              사용자 정보 오류 제보 목록
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              게이머들이 제보한 버전 오류, 링크 깨짐, 오타 등을 검토하고 처리 상태를 업데이트합니다.
            </p>
          </div>

          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => {
                const dateStr = new Date(r.createdAt).toLocaleDateString("ko-KR");
                return (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.reportType}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            r.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : r.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.status === "PENDING" ? "검토 대기중" : r.status === "RESOLVED" ? "처리 완료" : "반려됨"}
                        </span>
                        <span className="text-xs text-slate-400">{dateStr}</span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
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
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> 처리완료
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(r.id, "REJECTED")}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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

      {/* TAB 4: Security Audit Logs Hub */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>실시간 보안 감사 로그 스트림</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  모든 계정 변경, 로그인, 게임 등록, 패치 발행 이벤트가 Discord Webhook 및 DB에 즉시 기록됩니다.
                </p>
              </div>
              <Link
                href="/admin/logs"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                감사 로그 전체 보기 ↗
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentLogs.length > 0 ? (
                recentLogs.map((l: any) => (
                  <div key={l.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {l.action}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {l.title || "보안 이벤트"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {l.user?.email && <span>사용자: <code>{l.user.email}</code> | </span>}
                        <span>IP: <code>{l.ipAddress || "127.0.0.1"}</code></span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/logs/${l.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-white hover:text-blue-600 transition-colors shrink-0"
                    >
                      상세 보기
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-xs text-slate-400">
                  기록된 보안 감사 로그가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
