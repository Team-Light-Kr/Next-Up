import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform")?.toLowerCase() || "windows";
  const currentVersion = searchParams.get("version") || "1.0.0";
  const isTest = searchParams.get("test") === "true";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  // Target update versions (v1.0.2)
  const latestVersions: Record<string, {
    version: string;
    releaseDate: string;
    downloadUrl: string;
    webDownloadUrl?: string;
    mandatory: boolean;
    changelog: string[];
  }> = {
    windows: {
      version: "1.0.3",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/api/download?file=exe`,
      webDownloadUrl: `${appUrl}/download`,
      mandatory: false,
      changelog: [
        "상단 타이틀바 UI 전면 개편 (둥근 모서리, 브랜드 심볼 로고, 다크 모던 스타일 적용)",
        "Chromium 태그 및 네온 배지 완전 제거",
        "구버전 프로세스 자동 종료 및 클린 덮어쓰기 지원",
        "공식 Authenticode 디지털 인증서 서명 적용 (Team Light)",
        "인앱 실시간 자동 업데이트 프로그레스 다운로더 지원",
      ],
    },
    android: {
      version: "1.0.3",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/api/download?file=apk`,
      webDownloadUrl: `${appUrl}/download`,
      mandatory: false,
      changelog: [
        "모바일 반응형 뷰포트 정규화 및 터치 최적화",
        "화면 당겨서 새로고침(Swipe Refresh) 감도 개선",
        "인앱 최신 버전 감지 및 원클릭 다운로드 연동",
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
