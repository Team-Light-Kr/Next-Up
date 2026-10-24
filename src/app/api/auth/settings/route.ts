import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logToDiscord } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const {
      displayName,
      bio,
      avatarUrl,
      twoFactorType,
      phoneNumber,
      currentPassword,
      newPassword,
    } = await request.json();

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();
    if (twoFactorType && ["NONE", "EMAIL", "SMS", "OTP"].includes(twoFactorType)) {
      updateData.twoFactorType = twoFactorType;
    }
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();

    // Password Update Handler
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "새 비밀번호는 최소 6자 이상이어야 합니다." },
          { status: 400 }
        );
      }

      // Check existing password if user already had one
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true },
      });

      if (dbUser?.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "현재 비밀번호를 입력해 주세요." },
            { status: 400 }
          );
        }
        const isValid = verifyPassword(currentPassword, dbUser.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: "현재 비밀번호가 일치하지 않습니다." },
            { status: 400 }
          );
        }
      }

      updateData.passwordHash = hashPassword(newPassword);

      await logToDiscord({
        action: "PASSWORD_CHANGE",
        title: `비밀번호 설정/변경: ${user.displayName} (${user.email})`,
        description: `사용자가 계정 비밀번호를 성공적으로 설정/변경했습니다.`,
        userId: user.id,
        userEmail: user.email,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    await logToDiscord({
      action: "SETTINGS_UPDATE",
      title: `프로필 정보 수정: ${updatedUser.displayName}`,
      description: `계정 프로필 정보가 업데이트되었습니다.`,
      userId: user.id,
      userEmail: user.email,
      details: {
        displayName: updatedUser.displayName,
        twoFactorType: updatedUser.twoFactorType,
      },
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return NextResponse.json({
      success: true,
      user: { ...safeUser, hasPassword: Boolean(passwordHash) },
    });
  } catch (error: any) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "설정 저장 실패", detail: error.message }, { status: 500 });
  }
}
