import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { displayName, bio, avatarUrl, twoFactorType, phoneNumber } = await request.json();

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();
    if (twoFactorType && ["NONE", "EMAIL", "SMS", "OTP"].includes(twoFactorType)) {
      updateData.twoFactorType = twoFactorType;
    }
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "설정 저장 실패", detail: error.message }, { status: 500 });
  }
}
