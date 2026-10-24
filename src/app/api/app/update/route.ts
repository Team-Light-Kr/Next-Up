import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform")?.toLowerCase() || "windows";
  const currentVersion = searchParams.get("version") || "1.0.0";
  const isTest = searchParams.get("test") === "true";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  // Target update versions
  // Set latest version to 1.0.1 so clients running 1.0.0 will trigger update detection for testing
  const latestVersions: Record<string, {
    version: string;
    releaseDate: string;
    downloadUrl: string;
    webDownloadUrl?: string;
    mandatory: boolean;
    changelog: string[];
  }> = {

    windows: {
      version: "1.0.1",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/api/download?file=exe`,
      webDownloadUrl: `${appUrl}/download`,
      mandatory: false,
      changelog: [
        "Microsoft WebView2 완전 제거 및 Chromium 자체 독립 엔진 탑재",
        "커스텀 프레임리스 타이틀바 UI 및 다크 컨트롤 적용",
        "Google 세이프 브라우징 검사 통과 및 ZIP 무설치 패키지 추가",
        "신규 인앱 자동 업데이트 실시간 프로그레스 다운로더 연동",
      ],
    },
    android: {
      version: "1.0.1",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/api/download?file=apk`,
      webDownloadUrl: `${appUrl}/download`,
      mandatory: false,
      changelog: [
        "모바일 반응형 뷰포트 정규화 및 데스크톱 모드 버그 해결",
        "당겨서 새로고침(Swipe to Refresh) 성능 개선",
        "안드로이드 실시간 패치 알림 인앱 자동 업데이트 확인 연동",
      ],
    },
  };


  const target = latestVersions[platform] || latestVersions.windows;
  // If version is less than latestVersion or if isTest is true, trigger update!
  const hasUpdate = isTest || target.version !== currentVersion;

  return NextResponse.json({
    platform,
    currentVersion,
    latestVersion: target.version,
    hasUpdate,
    mandatory: target.mandatory,
    releaseDate: target.releaseDate,
    downloadUrl: target.downloadUrl,
    changelog: target.changelog,
  });
}
