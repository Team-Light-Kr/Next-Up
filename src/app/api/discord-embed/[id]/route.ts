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

  // Discord Components V2 Specification (Numeric Types)
  const container = {
    type: 17, // Container
    accent_color: 2450411, // #2563eb
    components: [
      {
        type: 9, // Section
        components: [
          {
            type: 10, // Text Display
            content: `보안 감사 • ${dateStr}\n# [NextUps 로그] ${title}\n작업 유형: \`${action}\` | 대상: \`${userText}\`\n\n${detailsSummary || "세부 파라미터가 안전하게 보관되었습니다."}`,
          },
        ],
        accessory: {
          type: 11, // Thumbnail
          media: {
            url: `${appUrl}/logo.png`,
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
            label: "관리자 로그 상세 확인",
            url: `${appUrl}/admin/logs/${id}`,
          },
          {
            type: 2, // Button
            style: 5, // Link Button
            label: "관리자 대시보드",
            url: `${appUrl}/admin/dashboard`,
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
      "Cache-Control": "public, max-age=3600",
    },
  });
}
