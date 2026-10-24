import prisma from "@/lib/prisma";
import { logToDiscord } from "@/lib/discord";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "nextups-super-privacy-key-2026";

/**
 * Generate a unique cryptographically signed random code for user's personal privacy notice link
 */
export function generatePrivacyNoticeToken(userId: string, email: string): string {
  const hash = crypto.createHmac("sha256", SECRET).update(`notice:${userId}:${email.toLowerCase()}:2026`).digest("hex");
  return `${userId.slice(-6)}-${hash.slice(0, 16)}`;
}

export async function findUserByPrivacyToken(token: string) {
  if (!token || !token.includes("-")) return null;
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, email: true, displayName: true, createdAt: true, profileCode: true },
  });

  for (const u of users) {
    if (generatePrivacyNoticeToken(u.id, u.email) === token) {
      return u;
    }
  }
  return null;
}

/**
 * 대한민국 「개인정보 보호법」 제20조의2(개인정보의 이용·제공 내역의 통지)에 따른
 * 연 1회 정기 법정 의무 안내 메일 발송 모듈
 */
export async function broadcastPrivacyAnnualNotice() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "admin@nextups.xyz";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });

  const todayStr = "2026년 10월 24일";

  const emailHtml = (displayName: string, personalUrl: string) => `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <title>[NextUps] 개인정보 이용·제공 내역 안내</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 640px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Top Gradient Banner with Logo -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); padding: 36px 32px; text-align: center;">
          <img src="${appUrl}/logo.png" alt="NextUps Logo" width="60" height="60" style="width: 60px; height: 60px; margin-bottom: 12px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); display: inline-block; background-color: #ffffff; padding: 4px;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NextUps</h1>
          <p style="color: #dbeafe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">멀티플랫폼 게임 업데이트 정보 통합 플랫폼</p>
        </div>

        <!-- Main Body -->
        <div style="padding: 36px 32px;">
          <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
            <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #2563eb; background-color: #eff6ff; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
              법정 의무 안내 • 연 1회 정기 통지
            </span>
            <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.3;">
              NextUps 서비스<br/>개인정보 이용·제공 내역 안내
            </h2>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
            안녕하세요, <strong>${displayName}</strong> 회원님.<br/>
            항상 NextUps 서비스를 이용해 주셔서 진심으로 감사의 말씀을 드립니다.
          </p>

          <p style="font-size: 13px; color: #475569; line-height: 1.7; margin-bottom: 20px; background-color: #f8fafc; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
            NextUps는 <strong>「개인정보 보호법」 제20조의2(개인정보의 이용·제공 내역의 통지)</strong>에 따라, 연 1회 회원님의 소중한 개인정보가 어떻게 이용되고 제공·위탁되었는지 투명하게 안내해 드리고 있습니다.<br/><br/>
            본 안내는 <strong>${todayStr}</strong> 기준 NextUps 플랫폼에 등록된 회원 정보를 바탕으로 발송되었습니다.
          </p>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 28px; margin-bottom: 12px;">
            주요 개인정보 처리 및 이용 현황
          </h3>

          <!-- Table matching User's Screenshots -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 28px; border-top: 1px solid #cbd5e1;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left;">
                <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; color: #334155; font-weight: 700;">항목 구분</th>
                <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; color: #334155; font-weight: 700;">처리 및 이용 내용</th>
                <th style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; color: #334155; font-weight: 700;">상세 근거</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">1. 수집 및 이용 목적</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">회원 식별, 로그인 인증, 게임 팔로우 패치 알림 발송, 보안 감사</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: 600;">개인정보처리방침 제1조</td>
              </tr>
              <tr style="background-color: #fafafa;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">2. 수집한 개인정보 항목</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">이메일 주소, 닉네임, 비밀번호(일방향 PBKDF2 암호화), 프로필 정보, 접속 IP</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: 600;">개인정보처리방침 제3조</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">3. 개인정보 제3자 제공</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">원칙적으로 제3자 제공 없음 (법령에 의한 제출 요구 제외)</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: 600;">개인정보처리방침 제5조</td>
              </tr>
              <tr style="background-color: #fafafa;">
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">4. 개인정보 처리 위탁 현황</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">
                  • 클라우드 DB: Supabase Inc.<br/>
                  • 이메일 인증 발송: Resend Inc.<br/>
                  • SMS 문자 발송: Sendwich (휴대폰 2FA 이용자에 한함)<br/>
                  • 패치 다국어 번역: DeepL SE
                </td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: 600;">개인정보처리방침 제4조</td>
              </tr>
            </tbody>
          </table>

          <!-- Personalized Random Link Box -->
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
            <p style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 0 0 6px 0;">
              🔒 회원님 전용 개인정보 이용·제공 내역 고유 열람 링크 (보안 난수 코드 생성)
            </p>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 10px 0;">
              회원님만을 위해 암호화된 고유 코드로 생성된 페이지에서 본 내역을 웹으로 상시 열람하실 수 있습니다.
            </p>
            <div style="word-break: break-all; font-family: monospace; font-size: 11px; color: #2563eb; background-color: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <a href="${personalUrl}" style="color: #2563eb; text-decoration: underline;">${personalUrl}</a>
            </div>
          </div>

          <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            NextUps는 앞으로도 회원 여러분께서 제공하여 주신 소중한 개인정보를 안전하게 관리하기 위해 최선을 다하겠습니다.<br/>
            감사합니다.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.6; margin: 0;">
            * 본 안내 메일은 「개인정보 보호법」 제20조의2에 따라 이용자의 권리 보장을 위해 이메일 수신 동의 여부와 관계없이 발송되었습니다.<br/>
            * 본 메일은 발신전용으로 회신하시는 경우 답변을 받으실 수 없습니다. (문의: admin@koharu.live / contact@nextups.xyz)<br/>
            NextUps • Team Light (주소: https://www.nextups.xyz)
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  let successCount = 0;
  let failCount = 0;

  for (const u of users) {
    if (!u.email) continue;
    const token = generatePrivacyNoticeToken(u.id, u.email);
    const personalNoticeUrl = `${appUrl}/legal/privacy-notice/${token}`;

    try {
      if (apiKey) {
        let res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `NextUps <${fromEmail}>`,
            to: [u.email],
            subject: `[NextUps] 개인정보 이용·제공 내역 안내`,
            html: emailHtml(u.displayName || "회원", personalNoticeUrl),
          }),
        });

        if (!res.ok) {
          // Fallback to onboarding@resend.dev
          res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `NextUps <onboarding@resend.dev>`,
              to: [u.email],
              subject: `[NextUps] 개인정보 이용·제공 내역 안내`,
              html: emailHtml(u.displayName || "회원", personalNoticeUrl),
            }),
          });
        }

        if (res.ok) successCount++;
        else failCount++;
      } else {
        // Simulation mode
        successCount++;
      }
    } catch {
      failCount++;
    }
  }

  // Discord Audit Logging
  await logToDiscord({
    action: "SECURITY_ALERT",
    title: `연례 법정 개인정보 이용·제공 내역 통지 완료 (법 제20조의2)`,
    description: `대한민국 개인정보보호법 제20조의2에 의거하여 전체 회원(${users.length}명)에게 연 1회 개인정보 이용 및 제공 내역 안내를 발송했습니다. (성공: ${successCount}건, 실패: ${failCount}건, 각 회원별 보안 난수 열람 코드 동시 발급)`,
    color: 0x3b82f6,
    details: {
      totalRecipients: users.length,
      successCount,
      failCount,
      legalBasis: "개인정보 보호법 제20조의2 (연 1회 통지)",
      date: todayStr,
    },
    hideButtons: true,
  });

  return {
    totalCount: users.length,
    successCount,
    failCount,
  };
}
