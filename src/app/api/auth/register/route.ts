import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateProfileCode, signSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, code, displayName } = await request.json();

    if (!email || !code || !displayName) {
      return NextResponse.json({ error: "이메일, 인증번호, 닉네임은 필수입니다." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: code.trim(),
        purpose: "REGISTER",
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

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "이미 가입된 회원입니다." }, { status: 409 });
    }

    // Generate unique 8-character profileCode
    let profileCode = generateProfileCode();
    let collision = await prisma.user.findUnique({ where: { profileCode } });
    while (collision) {
      profileCode = generateProfileCode();
      collision = await prisma.user.findUnique({ where: { profileCode } });
    }

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        displayName: displayName.trim(),
        profileCode,
        role: "USER",
        status: "ACTIVE",
      },
    });

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
      },
    });

    response.cookies.set("nextup_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "회원가입 실패", detail: error.message }, { status: 500 });
  }
}
