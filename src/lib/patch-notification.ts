import prisma from "@/lib/prisma";

interface NotifyFollowersOptions {
  gameId: string;
  updateId: string;
  version: string;
  title: string;
  summary?: string | null;
  platformName?: string;
}

/**
 * 관심 게임 패치노트 출시 시 팔로워들에게 알림 발송
 * 1) DB 내부 알림(Notification) 생성
 * 2) 브라우저 알림이 꺼져 있거나 이메일 알림을 수신하는 팔로워들에게 Resend 이메일 전송
 */
export async function notifyGameFollowers(options: NotifyFollowersOptions) {
  const { gameId, updateId, version, title, summary, platformName } = options;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { canonicalName: true, iconUrl: true, slug: true },
    });

    if (!game) return;

    // 팔로워 유저 목록 조회
    const followers = await prisma.gameFollow.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!followers || followers.length === 0) return;

    // 1. 인앱 알림 생성
    const notificationData = followers.map((f) => ({
      userId: f.user.id,
      gameId,
      updateId,
      title: `[새 패치] ${game.canonicalName} ${version}`,
      message: `'${title}' 패치노트가 공식 등록되었습니다.`,
    }));

    await prisma.notification.createMany({
      data: notificationData,
      skipDuplicates: true,
    }).catch(() => {});

    // 2. 이메일 알림 발송 (Resend 연동)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "admin@nextups.xyz";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

    if (!apiKey) {
      return;
    }

    const patchUrl = `${appUrl}/updates/${updateId}`;
    const pName = platformName || "공통 플랫폼";

    for (const follower of followers) {
      if (!follower.user.email) continue;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
          <div style="margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 14px; text-align: center;">
            <img src="${appUrl}/logo.png" alt="NextUps Logo" width="48" height="48" style="width: 48px; height: 48px; margin-bottom: 8px; border-radius: 10px; display: inline-block;" />
            <h1 style="color: #2563eb; margin: 0; font-size: 22px; font-weight: 800;">NextUps</h1>
            <p style="color: #64748b; font-size: 12px; margin-top: 3px; margin-bottom: 0;">관심 게임 실시간 패치노트 알림</p>
          </div>

          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">NEW PATCH RELEASE</span>
            <h2 style="color: #1e3a8a; font-size: 17px; font-weight: 700; margin: 4px 0 6px 0;">
              [${game.canonicalName}] ${version} 업데이트 출시
            </h2>
            <p style="color: #1e40af; font-size: 13px; margin: 0; line-height: 1.5;">
              회원님께서 관심 등록하신 <strong>${game.canonicalName}</strong> (${pName})의 새로운 공식 패치노트가 등록되었습니다.
            </p>
          </div>

          <div style="margin-bottom: 24px; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">${title}</p>
            <p style="font-size: 12px; color: #475569; margin: 0; line-height: 1.6;">
              ${summary || "공식 업데이트 상세 내역과 변경점을 확인하세요."}
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${patchUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-size: 13px; font-weight: 700;">
              패치노트 전문 및 변경점 보기 →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 14px;" />
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
            본 메일은 NextUps에서 관심 등록하신 게임의 패치 소식을 브라우저 알림 비활성화 대체로 수신하고 계신 회원님께 발송되었습니다.<br/>
            Team Light • NextUps
          </p>
        </div>
      `;

      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `NextUps <${fromEmail}>`,
          to: [follower.user.email],
          subject: `[NextUps] ${game.canonicalName} 새 패치 (${version}) 안내`,
          html: htmlContent,
        }),
      }).catch((err) => {
        console.error(`Failed to send email to ${follower.user.email}:`, err);
      });
    }
  } catch (error) {
    console.error("notifyGameFollowers error:", error);
  }
}
