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
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "클라이언트 다운로드 (Windows EXE / Android APK) | NextUps",
  description:
    "NextUps 공식 Windows 데스크톱 설치 프로그램(EXE) 및 Android 모바일 앱(APK)을 다운로드하세요. 디지털 서명 완료 및 실시간 자동 업데이트를 지원합니다.",
};

export default function DownloadPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>공식 네이티브 클라이언트 v1.0.0 출시</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          어디서나 가장 빠른 게임 업데이트,<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NextUps 공식 앱
          </span>으로 만나보세요
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Windows 데스크톱 환경과 Android 스마트폰 환경에 최적화된 독립 실행형 클라이언트입니다.<br className="hidden sm:inline" />
          마이크로소프트 디지털 서명(Authenticode)과 인앱 자동 업데이트 엔진이 탑재되어 안전하게 사용할 수 있습니다.
        </p>
      </div>

      {/* Main Download Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Windows Card */}
        <div className="relative rounded-3xl border-2 border-blue-500/30 bg-gradient-to-b from-white to-blue-50/20 p-8 shadow-lg shadow-blue-500/5 hover:border-blue-500 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold">
              추천 (PC)
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
                <span>v1.0.0 정식판</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                NextUps for Windows
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                독립 창 UI와 커스텀 프레임리스 타이틀바, Microsoft WebView2 런타임이 내장된 고성능 PC 전용 설치 프로그램입니다.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>커스텀 창 UI</strong>: 세련된 다크/화이트 컨트롤 및 프레임리스</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>디지털 서명(Authenticode)</strong>: 안전한 출처 보증 및 보안 검증</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>무중단 백그라운드 자동 업데이트</strong>: 실행 시 최신 패치 자동 감지</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <FileCheck2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span><strong>Inno Setup 7 패키징</strong>: 바탕화면 바로가기 및 클린 언인스톨</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <a
              href="/downloads/NextUps-Setup-v1.0.0.exe"
              download
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Windows 설치 프로그램 다운로드 (.exe)</span>
            </a>
            <p className="text-[11px] text-center text-slate-400">
              설치 파일 크기: 약 2.4 MB • Inno Setup 7 컴파일 완료
            </p>
          </div>
        </div>

        {/* Android Card */}
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between">
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              모바일 앱
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
                <span>v1.0.0 정식판</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                NextUps for Android
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                모바일 화면에 최적화된 반응형 뷰와 당겨서 새로고침(Swipe Refresh), 인앱 자동 버전 감지 기능이 내장된 Android 정식 APK 패키지입니다.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>풀스크린 반응형 모바일 UX</strong>: 제스처 및 뒤로가기 완벽 지원</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>인앱 자동 업데이트</strong>: 새 빌드 출시 시 원클릭 최신 버전 갱신</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>당겨서 새로고침 (Swipe to Refresh)</strong>: 실시간 패치 피드 즉시 동기화</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span><strong>스탠드얼론 APK 배포</strong>: 스토어 검수 지연 없이 최신 기능 바로 사용</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <a
              href="/downloads/NextUps-v1.0.0.apk"
              download
              className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Android APK 패키지 다운로드 (.apk)</span>
            </a>
            <p className="text-[11px] text-center text-slate-400">
              패키지 크기: 약 5.5 MB • Android 7.0(API 24) 이상 지원
            </p>
          </div>
        </div>
      </div>

      {/* System Requirements & Release Details */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>시스템 권장 사양 및 빌드 상세 정보</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Windows 권장 환경</h4>
            <p>• <strong>OS</strong>: Windows 10 (버전 1809 이상) / Windows 11 64-bit</p>
            <p>• <strong>런타임</strong>: Microsoft Edge WebView2 (Windows 11 기본 내장 / 미설치 시 자동 안내)</p>
            <p>• <strong>인스톨러</strong>: Inno Setup 7 (디지털 서명 날인 완료)</p>
            <p>• <strong>저장 공간</strong>: 최소 50MB 이상의 여유 공간</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Android 권장 환경</h4>
            <p>• <strong>OS</strong>: Android 7.0 (Nougat, API 24) 이상</p>
            <p>• <strong>권장 기종</strong>: Samsung Galaxy, Google Pixel, Xiaomi 등 모든 표준 안드로이드 스마트폰</p>
            <p>• <strong>설치 방법</strong>: 다운로드된 APK 파일을 탭한 후 '출처를 알 수 없는 앱 설치 허용' 진행</p>
            <p>• <strong>저장 공간</strong>: 최소 30MB 이상의 여유 공간</p>
          </div>
        </div>
      </div>
    </div>
  );
}
