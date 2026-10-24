import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationCode, sendEmailVerificationCode, sendSmsVerificationCode } from "@/lib/auth";
import { createSendwichVerification } from "@/lib/sendwich";


export async function POST(request: Request) {
  try {
    const { email, purpose = "REGISTER", channel } = await request.json();

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

    // 2FA Mode Handling: Check User's configured 2FA method
    const userTwoFactor = existing?.twoFactorType || "NONE";

    if ((purpose === "LOGIN" || purpose === "2FA") && userTwoFactor === "OTP") {
      // OTP doesn't send email or SMS; the user views the code in Google Authenticator
      return NextResponse.json({
        success: true,
        method: "OTP",
        message: "Google Authenticator(OTP) 앱에 표시된 6자리 코드를 입력해 주세요.",
      });
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code
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

    if (channel === "SMS" || ((purpose === "LOGIN" || purpose === "2FA") && userTwoFactor === "SMS")) {
      const sendwich = await createSendwichVerification({
        expectedPhone: existing?.phoneNumber || undefined,
        clientReference: cleanEmail,
      });

      // 백업 이메일로도 6자리 코드 동시 발송 (문자 전송이 어려운 환경 대비)
      try {
        await sendEmailVerificationCode(cleanEmail, code, purposeLabel);
      } catch {}

      return NextResponse.json({
        success: true,
        method: "SMS",
        sendwich: sendwich
          ? {
              id: sendwich.id,
              destination: sendwich.destination,
              smsText: sendwich.sms_text,
              verificationUrl: sendwich.verification_url,
            }
          : null,
        message: sendwich
          ? `샌드위치 수신 번호 [${sendwich.destination}] 로 문구 [${sendwich.sms_text}] 를 문자로 전송해 주세요.`
          : `가입 이메일(${cleanEmail})로 6자리 인증번호가 발송되었습니다.`,
      });
    }

    // Default or EMAIL 2FA
    await sendEmailVerificationCode(cleanEmail, code, purposeLabel);

    return NextResponse.json({
      success: true,
      method: "EMAIL",
      message: `${cleanEmail} 주소로 6자리 이메일 인증번호가 발송되었습니다.`,
    });
  } catch (error: any) {
    console.error("send-code error:", error);
    return NextResponse.json({ error: "인증번호 발송 실패", detail: error.message }, { status: 500 });
  }
}
