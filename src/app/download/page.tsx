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
    "NextUps 공식 Windows 데스크톱 클라이언트 및 Android 모바일 앱 최신 v1.0.3을 다운로드하세요.",
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
          <span>v1.0.3 공식 정식 빌드 배포 완료</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          NextUps 앱 다운로드
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          PC와 모바일 환경에서 관심 게임의 실시간 패치노트와 버전 업데이트를 가장 신속하게 확인하세요.
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
                Windows 데스크톱
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                바탕화면에서 가볍게 실행되며, 관심 게임의 패치 릴리스를 시스템 알림과 함께 실시간으로 전달합니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>NextUps 슬레이트 디자인 시스템 기반 전용 프레임워크</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>원클릭 간편 인스톨러 (이전 설치 환경 자동 감지 및 업그레이드)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>무중단 백그라운드 자동 업데이트 및 실시간 다운로드 진행률 표시</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Team Light 공식 Authenticode 코드 서명 및 바이너리 무결성 검증</span>
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
              <span>Windows 10 / 11 (64-bit)</span>
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
                Android 모바일
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                모바일 환경에 완벽히 대응하는 직관적인 레이아웃으로 이동 중에도 최신 패치 내역을 손쉽게 모니터링합니다.
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>모바일 디스플레이에 최적화된 고반응성 피드 뷰</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>당겨서 새로고침(Swipe-to-Refresh) 제스처 지원</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>신규 버전 출시 시 인앱 원클릭 패키지 수신</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>초경량 패키지 설계로 리소스 점유 및 배터리 소모 최소화</span>
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
              <span>약 5.3 MB • 정식 배포본</span>
            </div>
          </div>
        </div>
      </div>

      {/* Changelog Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">v1.0.3 릴리스 노트 (Release Notes)</h3>
              <p className="text-[11px] text-slate-500">배포일자: 2026년 10월 25일</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            안정성 및 동기화 향상 패치
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-600" />
              <span>Windows 데스크톱 v1.0.3 개선사항</span>
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">UI/UX 완성도 개선</strong>: 데스크톱 상단 프레임 및 공식 브랜드 심볼의 일관성을 강화하고 시인성을 개선했습니다.
              </li>
              <li>
                <strong className="text-slate-800">설치 및 업그레이드 프로세스 고도화</strong>: 기존 버전이 설치된 환경에서도 충돌 없이 최신 바이너리로 안전하게 갱신되도록 패키징을 보강했습니다.
              </li>
              <li>
                <strong className="text-slate-800">보안 코드 서명 갱신</strong>: 공식 Authenticode 디지털 서명 및 타임스탬프를 갱신하여 윈도우 보안 경고 없는 안정적 실행을 지원합니다.
              </li>
              <li>
                <strong className="text-slate-800">백그라운드 동기화 엔진 최적화</strong>: 패치 알림 수신 주기 및 다운로더 재시도 로직의 네트워크 신뢰성을 향상했습니다.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-800" />
              <span>Android 모바일 v1.0.3 개선사항</span>
            </h4>
            <ul className="space-y-2 text-slate-600 list-disc list-inside">
              <li>
                <strong className="text-slate-800">터치 인터랙션 반응성 향상</strong>: 터치 피드백 지연을 최소화하고 화면 스크롤 부드러움을 대폭 향상했습니다.
              </li>
              <li>
                <strong className="text-slate-800">제스처 새로고침 정밀 조정</strong>: 피드 상단 당겨서 새로고침(Swipe-to-Refresh) 시의 트리거 감도를 안정적으로 튜닝했습니다.
              </li>
              <li>
                <strong className="text-slate-800">신규 버전 감지 로직 강화</strong>: 앱 실행 시 새 릴리스 빌드 여부를 신속하게 체크하여 안내합니다.
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
