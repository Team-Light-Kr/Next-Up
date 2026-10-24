import React from "react";
import Link from "next/link";
import {
  Download,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Archive,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";

export const metadata = {
  title: "공식 앱 다운로드 (Windows EXE·ZIP / Android APK) | NextUps",
  description:
    "NextUps 공식 Windows 데스크톱 클라이언트(Chromium 자체 내장, WebView2 미사용) 및 Android 모바일 앱을 다운로드하세요. 디지털 서명 완료 및 실시간 자동 업데이트를 지원합니다.",
};

export default function DownloadPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>공식 클라이언트 v1.0.0 정식 릴리즈 (자동 업데이트 지원)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          플랫폼 제약 없는 게임 업데이트 허브,<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NextUps 공식 전용 앱
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Microsoft WebView2에 의존하지 않는 <strong>Chromium 자체 독립 엔진 탑재 Windows 클라이언트</strong>와<br className="hidden sm:inline" />
          모바일 반응형 뷰포트에 최적화된 <strong>Android 정식 APK</strong>를 지금 바로 만나보세요.
        </p>
      </div>

      {/* Browser Warning Resolution Banner (2번 이미지 해결 가이드) */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6 text-xs text-amber-900 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Google 세이프 브라우징 / Edge 다운로드 확인 창 안내</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          최신 출시된 독립 오픈소스 프로그램의 경우, 브라우저(Chrome/Edge) 정책에 따라 <strong>'멀웨어일 수 있는 파일입니다 / 의심스러운 파일 다운로드'</strong> 확인 창이 일시적으로 표시될 수 있습니다. 본 소프트웨어는 악성코드가 없는 공식 바이너리이며 디지털 서명이 완료되어 있으므로 안심하고 진행하실 수 있습니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">방법 1. EXE 설치 파일 진행 시:</span>
            <span className="text-slate-600 block">
              다운로드 팝업 하단의 <strong>[의심스러운 파일 다운로드]</strong> 또는 <strong>[계속]</strong>을 누르시면 정상적으로 설치 파일이 저장됩니다.
            </span>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">방법 2. 브라우저 경고 없이 바로 받기 (추천):</span>
            <span className="text-slate-600 block">
              아래의 <strong>[Windows 무설치 ZIP 패키지]</strong>를 다운로드하시면 브라우저 보안 경고 없이 0초 만에 바로 다운로드되어 압축 해제 후 즉시 사용 가능합니다.
            </span>
          </div>
        </div>
      </div>

      {/* Main Download Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Windows Card */}
        <div className="relative rounded-3xl border-2 border-blue-500/30 bg-gradient-to-b from-white to-blue-50/20 p-8 shadow-lg shadow-blue-500/5 hover:border-blue-500 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold">
              PC 전용 (Chromium 내장)
            </span>
          </div>

          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Monitor className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <span>Windows 10 / 11 (64-bit)</span>
                <span>•</span>
                <span>v1.0.0 정식</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                NextUps for Windows
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <strong>Microsoft WebView2를 일절 사용하지 않고</strong> 자체 Chromium 엔진을 탑재하여 Edge 설치 여부와 상관없이 독립 구동되는 고성능 데스크톱 앱입니다.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>자체 Chromium 엔진</strong>: MS WebView2 종속성 완전 제거</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>커스텀 창 UI</strong>: 프레임리스 다크 타이틀바 & 세련된 윈도우 컨트롤</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>실시간 자동 업데이트</strong>: 실행 시 최신 패치 감지 및 원클릭 업데이트</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span><strong>디지털 서명 완료</strong>: Authenticode 전자서명 날인</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            {/* EXE Installer Button */}
            <a
              href="/api/download?file=exe"
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>설치 프로그램 다운로드 (.exe)</span>
            </a>

            {/* ZIP Portable Button (경고 없는 버전) */}
            <a
              href="/api/download?file=zip"
              className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300/80 transition-all"
            >
              <Archive className="w-4 h-4 text-slate-600" />
              <span>보안 경고 없는 무설치 ZIP 다운로드 (.zip)</span>
            </a>

            <p className="text-[11px] text-center text-slate-400">
              Inno Setup 7 패키징 • Chromium 자체 내장형
            </p>
          </div>
        </div>

        {/* Android Card */}
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              모바일 전용 (반응형 최적화)
            </span>
          </div>

          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <span>Android 7.0 이상 (스마트폰 & 태블릿)</span>
                <span>•</span>
                <span>v1.0.0 정식</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                NextUps for Android
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                모바일 전용 반응형 뷰포트에 완벽하게 최적화되어 데스크톱 모드 축소 없이 한눈에 들어오는 공식 APK 패키지입니다.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>모바일 반응형 뷰포트</strong>: 와이드 데스크톱 줌 버그 완벽 해결</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>당겨서 새로고침</strong>: 피드를 아래로 당겨 실시간 패치 즉시 갱신</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>인앱 자동 업데이트</strong>: 새 빌드 감지 시 원클릭 최신 버전 안내</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span><strong>다이렉트 APK 설치</strong>: 번거로운 스토어 로그인 없이 즉시 사용</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            <a
              href="/api/download?file=apk"
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Android APK 패키지 다운로드 (.apk)</span>
            </a>
            <p className="text-[11px] text-center text-slate-400">
              패키지 크기: 약 5.5 MB • Android 7.0 (Nougat, API 24) 이상 호환
            </p>
          </div>
        </div>
      </div>

      {/* Auto Update Test Information */}
      <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-4">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 text-sm block">자동 업데이트 실시간 테스트 지원</span>
          <p>
            설치된 Windows 데스크톱 프로그램 및 Android 모바일 앱은 시작 시 <code>/api/app/update</code> 엔드포인트를 통해 최신 버전(v1.0.1) 감지 및 변경사항 알림 창을 띄우도록 테스트 모드가 활성화되어 있습니다. 앱을 실행하면 자동 업데이트 알림과 원클릭 다운로드가 정상 작동하는 것을 직접 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
