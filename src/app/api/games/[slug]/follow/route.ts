import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { slug } = await params;
    const game = await prisma.game.findUnique({
      where: { slug },
    });

    if (!game) {
      return NextResponse.json({ error: "게임을 찾을 수 없습니다." }, { status: 404 });
    }

    const existingFollow = await prisma.gameFollow.findUnique({
      where: {
        userId_gameId_platformId: {
          userId: user.id,
          gameId: game.id,
          platformId: null as any,
        },
      },
    });

    if (existingFollow) {
      await prisma.gameFollow.delete({
        where: { id: existingFollow.id },
      });
      return NextResponse.json({ following: false, message: "관심 게임 등록이 해제되었습니다." });
    } else {
      await prisma.gameFollow.create({
        data: {
          userId: user.id,
          gameId: game.id,
        },
      });

      // Create confirmation notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          gameId: game.id,
          title: "관심 게임 등록 완료",
          message: `[${game.canonicalName}]의 새로운 업데이트 소식이 배포되면 알림을 보내드립니다.`,
        },
      });

      return NextResponse.json({ following: true, message: "관심 게임으로 등록되었습니다." });
    }
  } catch (error: any) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "관심 게임 처리 실패", detail: error.message }, { status: 500 });
  }
}
