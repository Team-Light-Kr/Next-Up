import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logToDiscord } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { gameId, updateId, reportType, content } = await request.json();

    if (!reportType || !content || !content.trim()) {
      return NextResponse.json({ error: "제보 유형과 상세 내용을 입력해 주세요." }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        gameId: gameId || null,
        updateId: updateId || null,
        userId: user ? user.id : null,
        reportType,
        content: content.trim(),
        status: "PENDING",
      },
    });

    await logToDiscord({
      action: "REPORT_CREATED",
      title: `🚨 정보 오류 제보 접수: [${reportType}]`,
      color: 0xf59e0b, // Amber
      userId: user?.id,
      userEmail: user?.email,
      details: {
        reportId: report.id,
        reportType,
        content: content.trim(),
        gameId: gameId || null,
        updateId: updateId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "제보가 접수되었습니다. 관리자 검토 후 신속히 반영하겠습니다.",
      report,
    });
  } catch (error: any) {
    console.error("Report create error:", error);
    return NextResponse.json({ error: "제보 접수 실패", detail: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        game: { select: { slug: true, canonicalName: true } },
        update: { select: { id: true, version: true, title: true } },
        user: { select: { displayName: true, email: true } },
      },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Reports get error:", error);
    return NextResponse.json({ error: "제보 목록 조회 실패" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user && (user.role === "ADMIN" || user.email === "admin@koharu.live");
    if (!isAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { reportId, status } = await request.json();
    if (!reportId || !["PENDING", "RESOLVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    await logToDiscord({
      action: "REPORT_STATUS_UPDATED",
      title: `⚙️ 제보 처리 상태 갱신: ${reportId} -> ${status}`,
      color: status === "RESOLVED" ? 0x10b981 : 0xef4444,
      userId: user?.id,
      userEmail: user?.email,
      details: {
        reportId,
        newStatus: status,
      },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("Report patch error:", error);
    return NextResponse.json({ error: "제보 상태 갱신 실패", detail: error.message }, { status: 500 });
  }
}
