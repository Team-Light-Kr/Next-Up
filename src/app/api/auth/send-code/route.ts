import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationCode, sendEmailVerificationCode } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, purpose = "REGISTER" } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "유효한 이메일 주소를 입력해 주세요." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If purpose is register, check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (purpose === "REGISTER" && existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일 주소입니다. 로그인해 주세요." },
        { status: 409 }
      );
    }

    if (purpose === "LOGIN" && !existing) {
      return NextResponse.json(
        { error: "가입되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요." },
        { status: 404 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update verification code
    await prisma.verificationCode.create({
      data: {
        email: cleanEmail,
        code,
        purpose,
        expiresAt,
        used: false,
      },
    });

    const purposeLabel = purpose === "REGISTER" ? "회원가입" : purpose === "LOGIN" ? "로그인" : "2단계 인증";
    await sendEmailVerificationCode(cleanEmail, code, purposeLabel);

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} 주소로 6자리 인증번호가 발송되었습니다.`,
    });
  } catch (error: any) {
    console.error("send-code error:", error);
    return NextResponse.json({ error: "인증번호 발송 실패", detail: error.message }, { status: 500 });
  }
}
