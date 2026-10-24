import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        game: { select: { slug: true, canonicalName: true, iconUrl: true } },
        update: { select: { id: true, version: true, title: true } },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "알림 조회 실패" }, { status: 500 });
  }
}
