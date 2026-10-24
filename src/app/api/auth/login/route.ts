import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  signSessionToken,
  verifyPassword,
  hashPassword,
  generateVerificationCode,
  sendEmailVerificationCode,
  sendSmsVerificationCode,
  generateUserTotpSecret,
  verifyTotpCode,
} from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";
import { createSendwichVerification, checkSendwichStatus } from "@/lib/sendwich";


export async function POST(request: Request) {
  try {
    const { email, code, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해 주세요." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "등록된 사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 1. Password Verification (Mandatory)
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: "비밀번호를 입력해 주세요.", requirePassword: true },
          { status: 400 }
        );
      }
      const isValidPassword = verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        try {
          await logToDiscord({
            action: "SECURITY_ALERT",
            title: `로그인 실패 (비밀번호 불일치): ${user.email}`,
            description: `사용자 계정의 비밀번호 입력이 일치하지 않아 로그인이 차단되었습니다.`,
            userId: user.id,
            userEmail: user.email,
          });
        } catch {}
        return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 400 });
      }

    } else {
      // Legacy user without password - if password provided, save it!
      if (password && password.length >= 6) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashPassword(password) },
        });
      } else {
        // Create an alert notification for the user to set their password
        try {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "계정 보안: 비밀번호 설정 필요",
              message:
                "보안 체계 업데이트로 계정 비밀번호 설정이 필수가 되었습니다. 프로필 설정 페이지에서 비밀번호를 설정해 주세요.",
            },
          });
        } catch {
          // ignore notification collision
        }
      }
    }

    // 2. 2FA (Two-Factor Authentication) Enforcement
    const twoFactorType = user.twoFactorType || "NONE";

    if (twoFactorType !== "NONE") {
      // If 2FA is enabled but code is not provided yet, initiate challenge
      if (!code) {
        if (twoFactorType === "SMS") {
          const smsCode = generateVerificationCode();
          try {
            await prisma.verificationCode.create({
              data: {
                email: cleanEmail,
                code: smsCode,
                purpose: "2FA",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
              },
            });
          } catch {}

          const sendwich = await createSendwichVerification({
            expectedPhone: user.phoneNumber || undefined,
            clientReference: cleanEmail,
          });

          // 백업 이메일로도 6자리 코드 동시 발송
          try {
            await sendEmailVerificationCode(cleanEmail, smsCode, "2단계 인증");
          } catch {}

          return NextResponse.json({
            require2FA: true,
            twoFactorType: "SMS",
            sendwich: sendwich
              ? {
                  id: sendwich.id,
                  destination: sendwich.destination,
                  smsText: sendwich.sms_text,
                  verificationUrl: sendwich.verification_url,
                }
              : null,
            message: sendwich
              ? `샌드위치 수신 번호 [${sendwich.destination}] 로 문구 [${sendwich.sms_text}] 를 문자로 전송해 주세요. (가입 이메일로도 6자리 코드가 발송되었습니다)`
              : `가입 이메일(${cleanEmail})로 6자리 2단계 인증 코드가 발송되었습니다.`,
          });
        }
 else if (twoFactorType === "OTP") {
          return NextResponse.json({
            require2FA: true,
            twoFactorType: "OTP",
            message: "Google Authenticator 앱의 6자리 보안 코드를 입력해 주세요.",
          });
        } else if (twoFactorType === "EMAIL") {
          const emailCode = generateVerificationCode();
          await prisma.verificationCode.create({
            data: {
              email: cleanEmail,
              code: emailCode,
              purpose: "2FA",
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          });
          await sendEmailVerificationCode(cleanEmail, emailCode, "2단계 인증");
          return NextResponse.json({
            require2FA: true,
            twoFactorType: "EMAIL",
            message: `${cleanEmail} 주소로 6자리 이메일 인증 코드가 발송되었습니다.`,
          });
        }
      }

      // If code was provided, verify according to 2FA type
      if (twoFactorType === "OTP") {
        const secret = generateUserTotpSecret(user.id);
        const isValidTotp = verifyTotpCode(secret, code.trim());
        if (!isValidTotp) {
          return NextResponse.json(
            { error: "Google Authenticator 보안 코드가 일치하지 않습니다. (시간을 확인해 주세요)" },
            { status: 400 }
          );
        }
      } else {
        // SMS or EMAIL code verification (Supports both 6-digit codes and Sendwich verification IDs)
        let isCodeValid = false;

        if (code.trim().startsWith("vrf_")) {
          const swStatus = await checkSendwichStatus(code.trim());
          if (swStatus.verified) {
            isCodeValid = true;
          }
        }

        if (!isCodeValid) {
          const validCode = await prisma.verificationCode.findFirst({
            where: {
              email: cleanEmail,
              code: code.trim(),
              purpose: { in: ["LOGIN", "2FA", "REGISTER", "VERIFY"] },
              used: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (validCode) {
            isCodeValid = true;
            try {
              await prisma.verificationCode.update({
                where: { id: validCode.id },
                data: { used: true },
              });
            } catch {}
          }
        }

        if (!isCodeValid) {
          return NextResponse.json(
            { error: "인증번호가 일치하지 않거나 문자 인증이 아직 완료되지 않았습니다." },
            { status: 400 }
          );
        }
      }
    }



    // Check admin escalation for admin@koharu.live
    let userRole = user.role;
    if (cleanEmail === "admin@koharu.live" || cleanEmail === "admin@nextups.xyz") {
      userRole = "ADMIN";
      if (user.role !== "ADMIN") {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
        } catch {}
      }
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: userRole,
      profileCode: user.profileCode,
    });

    // Send login audit log to Discord (non-blocking)
    try {
      await logToDiscord({
        action: "USER_LOGIN",
        title: `로그인 성공: ${user.displayName} (${user.email})`,
        description: `사용자가 서비스에 성공적으로 로그인했습니다. (역할: ${userRole})`,
        userId: user.id,
        userEmail: user.email,
        details: {
          profileCode: user.profileCode,
          role: userRole,
          hasPassword: Boolean(user.passwordHash || password),
        },
      });
    } catch (discordErr) {
      console.warn("Failed to dispatch Discord audit log:", discordErr);
    }


    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileCode: user.profileCode,
        role: userRole,
        hasPassword: Boolean(user.passwordHash || password),
        twoFactorType: user.twoFactorType,
      },
    });

    response.cookies.set("nextup_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 365 * 24 * 60 * 60, // 10 years (Permanent until explicit logout)
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 처리 실패", detail: error.message }, { status: 500 });
  }
}
