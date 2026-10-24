import {
  Download,
  Monitor,
  Smartphone,
  Archive,
  Cpu,
  Check,
} from "lucide-react";
import { buildDownloadEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const metadata = {
  title: "NextUps 다운로드",
  description:
    "NextUps 공식 Windows 데스크톱 클라이언트 및 Android 모바일 앱을 다운로드하세요.",
  other: {
    "discord:component-embed": toComponentEmbedJson(buildDownloadEmbed()),
  },
};

export default function DownloadPage() {
  const discordCard = buildDownloadEmbed();
  const discordJson = toComponentEmbedJson(discordCard);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>최신 버전 1.0.1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          NextUps 앱 다운로드
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          PC와 스마트폰에서 실시간 게임 업데이트 소식과 패치노트를 빠르게 확인하세요.
        </p>
      </div>

      {/* Main Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Windows Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                v1.0.1 Windows
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
                <span>독립 실행형 경량 데스크톱 클라이언트</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>새 버전 출시 시 앱 내 원클릭 간편 업데이트</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>간편한 설치 마법사 및 디지털 인증서 서명</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            <a
              href="/api/download?file=exe"
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Windows 설치 프로그램 다운로드</span>
            </a>

            <a
              href="/api/download?file=zip"
              className="w-full py-2.5 px-5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>무설치 포터블 버전 (.zip)</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 px-1">
              <span>Windows 10, 11 (64-bit)</span>
              <span>약 80 MB</span>
            </div>
          </div>
        </div>

        {/* Android Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                v1.0.1 Android
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
                <span>약 5MB의 가볍고 빠른 설치 패키지</span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2.5">
            <a
              href="/api/download?file=apk"
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Android APK 다운로드</span>
            </a>

            <div className="py-2.5 text-center text-xs text-slate-600 font-medium">
              직접 설치(사이드로드) 지원
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 px-1">
              <span>Android 7.0 이상</span>
              <span>약 5.3 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-500" />
          <span>시스템 권장 사양</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-600 font-medium block">Windows</span>
            <span className="text-xs font-bold text-slate-900 block">Windows 10 / 11 (64-bit)</span>
            <span className="text-[11px] text-slate-600 block">메모리 2GB 이상</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-600 font-medium block">Android</span>
            <span className="text-xs font-bold text-slate-900 block">Android 7.0 (Nougat) 이상</span>
            <span className="text-[11px] text-slate-600 block">스마트폰 및 태블릿 지원</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-600 font-medium block">네트워크</span>
            <span className="text-xs font-bold text-slate-900 block">인터넷 연결 필요</span>
            <span className="text-[11px] text-slate-600 block">실시간 패치 피드 동기화</span>
          </div>
        </div>
      </div>
    </div>
  );
}
