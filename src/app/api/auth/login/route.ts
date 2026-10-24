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
        await logToDiscord({
          action: "SECURITY_ALERT",
          title: `로그인 실패 (비밀번호 불일치): ${user.email}`,
          description: `사용자 계정의 비밀번호 입력이 일치하지 않아 로그인이 차단되었습니다.`,
          userId: user.id,
          userEmail: user.email,
        });
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
          if (!user.phoneNumber) {
            return NextResponse.json(
              { error: "SMS 2단계 인증이 활성화되어 있으나 등록된 전화번호가 없습니다." },
              { status: 400 }
            );
          }
          const smsCode = generateVerificationCode();
          await prisma.verificationCode.create({
            data: {
              email: cleanEmail,
              code: smsCode,
              purpose: "2FA",
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
          });
          await sendSmsVerificationCode(user.phoneNumber, smsCode, cleanEmail);
          const masked = user.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1-****-$2");
          return NextResponse.json({
            require2FA: true,
            twoFactorType: "SMS",
            message: `등록된 휴대폰(${masked}) 및 가입 이메일로 6자리 인증번호가 발송되었습니다.`,
          });
        } else if (twoFactorType === "OTP") {
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
        // SMS or EMAIL code verification
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
          return NextResponse.json(
            { error: "인증번호가 일치하지 않거나 만료되었습니다." },
            { status: 400 }
          );
        }

        await prisma.verificationCode.update({
          where: { id: validCode.id },
          data: { used: true },
        });
      }
    }

    // Check admin escalation for admin@koharu.live
    let userRole = user.role;
    if (cleanEmail === "admin@koharu.live" || cleanEmail === "admin@nextups.xyz") {
      userRole = "ADMIN";
      if (user.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: userRole,
      profileCode: user.profileCode,
    });

    // Send login audit log to Discord
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
