import { NextResponse } from "next/server";

export async function GET() {
  const container = {
    type: 17, // Container
    accent_color: 2450411, // #2563eb as decimal integer
    components: [
      {
        type: 9, // Section
        components: [
          {
            type: 10, // Text Display
            content:
              "# NextUps • 멀티플랫폼 게임 업데이트 통합 플랫폼\nWindows, Android, Steam 공식 최신 패치노트를 가장 빠르고 신속하게 확인하세요.",
          },
        ],
        accessory: {
          type: 11, // Thumbnail
          media: {
            url: "https://www.nextups.xyz/logo.png",
          },
        },
      },
      {
        type: 14, // Separator
        divider: true,
        spacing: 1,
      },
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 5, // Link Button
            label: "최신 게임 패치 보기",
            url: "https://www.nextups.xyz/games",
          },
          {
            type: 2, // Button
            style: 5, // Link Button
            label: "공식 앱 다운로드",
            url: "https://www.nextups.xyz/download",
          },
        ],
      },
    ],
  };

  const payload = {
    version: 2,
    component: container,
    ...container,
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/vnd.discord.component-embed+json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
