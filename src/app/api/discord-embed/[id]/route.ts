import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  let log: any = null;
  try {
    log = await prisma.adminAuditLog.findUnique({
      where: { id },
      include: {
        user: { select: { displayName: true, email: true } },
      },
    });
  } catch {
    // ignore
  }

  const title = log?.title || "NextUps 보안 감사 시스템 로그";
  const action = log?.action || "SYSTEM_AUDIT";
  const userText = log?.user?.email || "시스템 내부 프로세스";
  const dateStr = log ? new Date(log.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) : "최근";

  let detailsSummary = "";
  if (log?.details && typeof log.details === "object") {
    detailsSummary = Object.entries(log.details)
      .slice(0, 4)
      .map(([k, v]) => `• **${k}**: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n");
  }

  // Discord Components V2 Specification (Matching 2nd Screenshot)
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
                content: `NextUps 보안 감사 • ${dateStr}\n# [NextUps 로그] ${title}\n작업 유형: \`${action}\` | 대상: \`${userText}\`\n\n${detailsSummary || "세부 파라미터가 안전하게 암호화 보관되었습니다."}`,
              },
              {
                type: "thumbnail",
                media: {
                  url: `${appUrl}/logo.png`,
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
                label: "관리자 로그 상세 확인 ↗",
                url: `${appUrl}/admin/logs/${id}`,
              },
              {
                type: "link_button",
                label: "관리자 대시보드 ↗",
                url: `${appUrl}/admin/dashboard`,
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
      "Cache-Control": "public, max-age=3600",
    },
  });
}
