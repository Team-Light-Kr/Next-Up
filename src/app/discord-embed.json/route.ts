import { NextResponse } from "next/server";

export async function GET() {
  const componentEmbed = {
    version: 2,
    accent_color: "#2563eb",
    components: [
      {
        type: "container",
        components: [
          {
            type: "section",
            components: [
              {
                type: "text_display",
                content:
                  "# NextUps • 게임 업데이트 및 패치 통합 플랫폼\nWindows, Android, iOS, macOS 공식 업데이트 노트를 가장 빠르게 확인하세요.",
              },
              {
                type: "thumbnail",
                media: {
                  url: "https://www.nextups.xyz/logo.png",
                },
              },
            ],
          },
          {
            type: "separator",
          },
          {
            type: "action_row",
            components: [
              {
                type: "link_button",
                label: "최신 게임 패치 보러가기 ↗",
                url: "https://www.nextups.xyz/games",
              },
              {
                type: "link_button",
                label: "NextUps 공식 사이트",
                url: "https://www.nextups.xyz",
              },
            ],
          },
        ],
      },
    ],
  };

  return NextResponse.json(componentEmbed, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
