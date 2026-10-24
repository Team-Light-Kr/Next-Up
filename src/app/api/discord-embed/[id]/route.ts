import prisma from "@/lib/prisma";
import { buildAuditLogEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

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
  const userEmail = log?.user?.email || null;

  const card = buildAuditLogEmbed(
    {
      id,
      title,
      action,
      details: log?.details,
      userEmail,
    },
    appUrl
  );

  const jsonStr = toComponentEmbedJson(card);

  return new Response(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.discord.component-embed+json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

