import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const isAdmin =
      user &&
      (user.role === "ADMIN" ||
        user.email === "admin@koharu.live" ||
        user.email === "admin@nextups.xyz");

    if (!isAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const [
      totalGames,
      totalUpdates,
      totalUsers,
      pendingReports,
      totalAuditLogs,
      recentJobs,
    ] = await Promise.all([
      prisma.game.count().catch(() => 0),
      prisma.update.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
      prisma.report.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.adminAuditLog.count().catch(() => 0),
      prisma.dataCollectionJob.findMany({
        take: 5,
        orderBy: { startedAt: "desc" },
      }).catch(() => []),
    ]);

    const recentLogs = await prisma.adminAuditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { displayName: true, email: true } },
      },
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      stats: {
        totalGames,
        totalUpdates,
        totalUsers,
        pendingReports,
        totalAuditLogs,
      },
      recentJobs,
      recentLogs,
      systemStatus: {
        database: "OPERATIONAL",
        deeplApi: Boolean(process.env.DEEPL_API_KEY),
        resendEmail: Boolean(process.env.RESEND_API_KEY),
        sendwichSms: Boolean(process.env.SENDWICH_API_KEY),
        discordWebhook: Boolean(process.env.DISCORD_WEBHOOK_URL),
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "통계 데이터 조회 실패" }, { status: 500 });
  }
}
