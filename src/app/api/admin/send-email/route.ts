import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser && (currentUser.role === "ADMIN" || currentUser.email === "admin@koharu.live" || currentUser.email === "admin@nextups.xyz");
    if (!isAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { subject, message, targetType = "ALL", customEmail = "" } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "이메일 제목과 본문 내용을 모두 입력해 주세요." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || "";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

    let targetEmails: string[] = [];

    if (targetType === "CUSTOM" && customEmail.trim()) {
      targetEmails = [customEmail.trim()];
    } else {
      const users = await prisma.user.findMany({
        select: { email: true },
      });
      targetEmails = Array.from(new Set(users.map((u) => u.email).filter(Boolean)));
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: "발송할 수신자 이메일이 없습니다." }, { status: 400 });
    }

    const formattedMessage = message
      .trim()
      .split("\n\n")
      .map((p: string) => `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.7; color: #334155;">${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <!-- Logo Header -->
        <div style="text-align: center; margin-bottom: 28px;">
          <img src="${appUrl}/logo.png" alt="NextUps" width="56" height="56" style="border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); margin-bottom: 12px;" />
          <h1 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">NextUps 공식 공지 알림</h1>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">게임 업데이트 통합 플랫폼 운영팀</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">${subject}</h2>
          ${formattedMessage}
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${appUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
            NextUps 바로가기 →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
          본 메일은 NextUps 서비스 가입 회원을 대상으로 발송된 공식 공지 메일입니다.<br/>
          Team Light • NextUps 운영팀 (문의: admin@nextups.xyz)
        </p>
      </div>
    `;

    let successCount = 0;
    let failCount = 0;

    for (const email of targetEmails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `NextUps 운영팀 <${fromEmail}>`,
            to: [email],
            subject: `[NextUps] ${subject}`,
            html: emailHtml,
          }),
        });

        if (res.ok) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }

    // Log to Discord Webhook
    await logToDiscord({
      action: "TERMS_BROADCAST",
      title: `관리자 공지 이메일 발송: ${subject}`,
      description: `관리자 ${currentUser.displayName} (${currentUser.email})님이 총 ${targetEmails.length}명 대상 공지 이메일을 발송했습니다. (성공: ${successCount}, 실패: ${failCount})`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      details: {
        subject,
        targetType,
        totalRecipients: targetEmails.length,
        successCount,
        failCount,
      },
    });

    return NextResponse.json({
      success: true,
      total: targetEmails.length,
      successCount,
      failCount,
    });
  } catch (error: any) {
    console.error("Admin send email error:", error);
    return NextResponse.json({ error: "이메일 발송 실패", detail: error.message }, { status: 500 });
  }
}
