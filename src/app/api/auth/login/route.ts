import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "이메일과 인증번호를 입력해 주세요." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: code.trim(),
        purpose: { in: ["LOGIN", "2FA"] },
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validCode) {
      return NextResponse.json({ error: "인증번호가 일치하지 않거나 만료되었습니다." }, { status: 400 });
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: validCode.id },
      data: { used: true },
    });

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "등록된 사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      profileCode: user.profileCode,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileCode: user.profileCode,
        role: user.role,
        twoFactorType: user.twoFactorType,
      },
    });

    response.cookies.set("nextup_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 처리 실패", detail: error.message }, { status: 500 });
  }
}
