import {
  Download,
  Monitor,
  Smartphone,
  Archive,
  Cpu,
  Check,
  Sparkles,
  ShieldCheck,
  History,
} from "lucide-react";
import { buildDownloadEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const metadata = {
  title: "NextUps 앱 다운로드",
  description:
    "NextUps 공식 Windows 데스크톱 클라이언트 및 Android 모바일 앱 최신 v1.0.2를 다운로드하세요.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildDownloadEmbed()),
  },
};

export default function DownloadPage() {
  const discordCard = buildDownloadEmbed();
  const discordJson = toComponentEmbedJson(discordCard);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>v1.0.3 최신 정식 빌드 배포 완료</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          NextUps 앱 다운로드
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          PC와 스마트폰에서 실시간 게임 업데이트 소식과 패치노트를 가장 빠르게 확인하세요.
        </p>
      </div>

      {/* Main Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Windows Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-all">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                v1.0.3 (Windows x64)
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Windows
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                바탕화면에서 빠르게 실행하고 패치 소식을 실시간으로 확인하는 PC 전용 프로그램입니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>둥근 모서리 커스텀 타이틀바 및 로고 적용 (네온 제거)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>구버전 자동 종료 및 클린 덮어쓰기 인스톨러</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>인앱 실시간 자동 업데이트 프로그레스 다운로더</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>공식 Authenticode 디지털 서명 적용 (Team Light)</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            <a
              href="/api/download?file=exe"
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Windows 설치 프로그램 (v1.0.3 .exe)</span>
            </a>

            <a
              href="/api/download?file=zip"
              className="w-full py-2.5 px-5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>무설치 포터블 버전 (v1.0.3 .zip)</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
              <span>Windows 10, 11 (64-bit)</span>
              <span>약 80 MB • 인증서 서명 완료</span>
            </div>
          </div>
        </div>

        {/* Android Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-xs hover:border-slate-400 transition-all">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                v1.0.3 Android
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Android
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                모바일 화면에 최적화된 인터페이스로 언제 어디서나 최신 패치를 모니터링합니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>모바일 화면에 맞춘 최적화 레이아웃</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>화면 당겨서 새로고침(Swipe Refresh)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>인앱 업데이트 확인 및 원클릭 패키지 수신</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>약 5.3MB의 초경량 패키지</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            <a
              href="/api/download?file=apk"
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Android APK 다운로드 (v1.0.3)</span>
            </a>

            <div className="py-2.5 text-center text-xs text-slate-600 font-medium">
              직접 설치(사이드로드) 지원
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
              <span>Android 7.0 이상</span>
              <span>약 5.3 MB • 정식 패키지</span>
            </div>
          </div>
        </div>
      </div>

      {/* Changelog Section (v1.0.2 Release Notes) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">v1.0.3 주요 업데이트 내역 (Changelog)</h3>
              <p className="text-[11px] text-slate-500">배포일자: 2026년 10월 25일</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            UI 및 버전 동기화 패치
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-600" />
              <span>Windows 데스크톱 v1.0.3 변경사항</span>
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">상단바 UI 전면 개편</strong>: 둥근 모서리와 공식 브랜드 심볼 로고, 단정한 다크 슬레이트 스타일 적용 (Chromium 문구 및 네온 배지 완전 제거)
              </li>
              <li>
                <strong className="text-slate-800">구버전 자동 종료 및 덮어쓰기</strong>: 설치 시 실행 중이던 이전 프로세스를 강제 종료하고 최신 파일로 완전 교체
              </li>
              <li>
                <strong className="text-slate-800">디지털 인증서 서명 갱신</strong>: 공식 Authenticode 코드 서명 및 타임스탬프 적용 (게시자: Team Light)
              </li>
              <li>
                <strong className="text-slate-800">인앱 자동 다운로더 안정화</strong>: 업데이트 감지 시 새 버전 패키지 즉시 다운로드 및 자동 재실행
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-800" />
              <span>Android 모바일 v1.0.3 변경사항</span>
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">모바일 터치 최적화</strong>: 반응형 화면 정규화 및 모바일 기기 터치 반응 속도 개선
              </li>
              <li>
                <strong className="text-slate-800">Swipe-to-Refresh 안정화</strong>: 실시간 패치 소식 새로고침 감도 개선
              </li>
              <li>
                <strong className="text-slate-800">인앱 최신 버전 알림</strong>: 새 버전 배포 감지 및 원클릭 수신
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-500" />
          <span>시스템 권장 사양</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Windows</span>
            <span className="text-xs font-bold text-slate-900 block">Windows 10 / 11 (64-bit)</span>
            <span className="text-[11px] text-slate-500 block">메모리 2GB 이상 • 자체 독립 엔진</span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">Android</span>
            <span className="text-xs font-bold text-slate-900 block">Android 7.0 (Nougat) 이상</span>
            <span className="text-[11px] text-slate-500 block">스마트폰 및 태블릿 지원</span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">네트워크</span>
            <span className="text-xs font-bold text-slate-900 block">인터넷 연결 필요</span>
            <span className="text-[11px] text-slate-500 block">실시간 패치 피드 동기화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
