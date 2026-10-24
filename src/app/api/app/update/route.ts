import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform")?.toLowerCase() || "windows";
  const currentVersion = searchParams.get("version") || "1.0.0";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  // Latest App Versions
  const latestVersions: Record<string, {
    version: string;
    releaseDate: string;
    downloadUrl: string;
    mandatory: boolean;
    changelog: string[];
  }> = {
    windows: {
      version: "1.0.0",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/downloads/NextUps-Setup-v1.0.0.exe`,
      mandatory: false,
      changelog: [
        "NextUps Windows 공식 데스크톱 릴리즈",
        "커스텀 프레임리스 타이틀바 및 고성능 WebView2 탑재",
        "디지털 서명(Authenticode) 인증 완료",
        "백그라운드 자동 패치노트 알림 및 무중단 자동 업데이트 지원",
      ],
    },
    android: {
      version: "1.0.0",
      releaseDate: "2026-10-24",
      downloadUrl: `${appUrl}/downloads/NextUps-v1.0.0.apk`,
      mandatory: false,
      changelog: [
        "NextUps Android 공식 모바일 APK 릴리즈",
        "실시간 게임 업데이트 인앱 푸시 알림",
        "모바일 최적화 풀스크린 인터페이스 및 자동 업데이트 감지",
      ],
    },
  };

  const target = latestVersions[platform] || latestVersions.windows;
  const hasUpdate = target.version !== currentVersion;

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
