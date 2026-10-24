import prisma from "@/lib/prisma";
import { logToDiscord } from "@/lib/discord";

export async function sendTermsUpdateNotification(targetEmail: string, displayName?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "admin@nextups.xyz";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured for terms broadcast.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 36px 28px; border: 1px solid #e2e8f0; border-radius: 18px; background-color: #ffffff; color: #1e293b;">
      <div style="margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 16px; text-align: center;">
        <img src="${appUrl}/logo.png" alt="NextUps Logo" width="56" height="56" style="width: 56px; height: 56px; margin-bottom: 8px; border-radius: 12px; display: inline-block;" />
        <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NextUps</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px; margin-bottom: 0;">멀티플랫폼 게임 업데이트 정보 통합 플랫폼</p>
      </div>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
        <h2 style="color: #1e3a8a; font-size: 16px; font-weight: 700; margin: 0 0 6px 0;">[안내] 서비스 이용약관 및 개인정보처리방침 개정 안내</h2>
        <p style="color: #1e40af; font-size: 13px; margin: 0; line-height: 1.5;">
          안녕하세요, NextUps 회원님 (${displayName || targetEmail}).<br/>
          항상 NextUps 서비스를 이용해 주시는 회원 여러분께 감사드리며, 더욱 안전하고 신뢰할 수 있는 서비스를 제공하기 위해 이용약관 및 개인정보처리방침이 개정됨을 안내해 드립니다.
        </p>
      </div>

      <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">1. 주요 개정 사항 안내</h3>
      <ul style="font-size: 13px; line-height: 1.8; color: #334155; padding-left: 20px; margin-bottom: 24px;">
        <li><strong>비밀번호 필수 인증 체계 도입:</strong> 계정 보안 강화를 위해 회원가입 및 로그인 시 최소 6자 이상의 비밀번호 설정이 필수가 되었습니다. (기존 비밀번호가 없는 회원은 <em>설정</em> 페이지에서 언제든 비밀번호를 등록하실 수 있습니다.)</li>
        <li><strong>실시간 보안 감사 로깅 시스템(Discord Webhook) 명시:</strong> 계정 도용 및 비정상적 사이버 위협을 예방하기 위한 운영팀의 보안 로그 기록 및 관리자 열람 권한 규정을 추가하였습니다.</li>
        <li><strong>지식재산권 및 비영리 공공 플랫폼 정책 구체화:</strong> 개발사 및 퍼블리셔의 원저작권을 존중하는 링크 인용 원칙을 명문화하였습니다.</li>
      </ul>

      <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">2. 적용 및 시행 일자</h3>
      <p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 28px;">
        • <strong>시행 일자:</strong> 2026년 10월 31일 (토요일)<br/>
        • <strong>공지 일자:</strong> 2026년 10월 24일 (시행 7일 전 사전 공지 준수)
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${appUrl}/legal/terms" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
          개정된 이용약관 전문 확인하기 →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
        본 메일은 관련 법령에 따른 이용자 권리 보장을 위해 발송된 중요 공지 메일입니다.<br/>
        Team Light • NextUps 운영팀 (문의: admin@nextups.xyz)
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `NextUps 운영팀 <${fromEmail}>`,
        to: [targetEmail],
        subject: `[NextUps] 서비스 이용약관 및 개인정보처리방침 개정 안내 (2026년 10월 31일 시행)`,
        html: htmlContent,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Terms email send error:", err);
    return false;
  }
}

export async function broadcastTermsToAllUsers() {
  try {
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { email: true, displayName: true },
    });

    let successCount = 0;
    for (const u of users) {
      const ok = await sendTermsUpdateNotification(u.email, u.displayName);
      if (ok) successCount++;
    }

    await logToDiscord({
      action: "TERMS_BROADCAST",
      title: `약관 개정 안내 메일 발송 완료`,
      description: `전체 활성 회원 (${successCount}/${users.length}명)에게 개정 약관 안내 전자우편이 성공적으로 발송되었습니다.`,
      details: {
        totalUsers: users.length,
        delivered: successCount,
        effectiveDate: "2026-10-31",
      },
    });

    return { total: users.length, delivered: successCount };
  } catch (error) {
    console.error("Broadcast terms failed:", error);
    return { total: 0, delivered: 0 };
  }
}
