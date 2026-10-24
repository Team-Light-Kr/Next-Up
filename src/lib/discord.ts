import prisma from "@/lib/prisma";

const DEFAULT_WEBHOOK_URL = [
  "https:",
  "",
  "discord.com",
  "api",
  "webhooks",
  "1563366419079495741",
  "g4aDzEmLMUwtjiBkIYiFC8uACG4tUrdtC__ai6ZFdnlpMnj4LR83kmYrJSf--qFbm7H7",
].join("/");

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

export interface LogEventOptions {
  action:
    | "USER_REGISTER"
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "GAME_CREATE"
    | "GAME_UPDATE"
    | "UPDATE_CREATE"
    | "REPORT_SUBMIT"
    | "SETTINGS_UPDATE"
    | "PASSWORD_CHANGE"
    | "TERMS_BROADCAST"
    | "SECURITY_ALERT"
    | "ADMIN_GAME_CREATED"
    | "ADMIN_UPDATE_CREATED"
    | "REPORT_CREATED"
    | "REPORT_STATUS_UPDATED"
    | string;
  title: string;
  description?: string;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  details?: Record<string, any>;
  color?: number; // Discord hex color
}

// Color map for different action types
const ACTION_COLORS: Record<string, number> = {
  USER_REGISTER: 0x10b981, // Emerald green
  USER_LOGIN: 0x3b82f6, // Blue
  USER_LOGOUT: 0x64748b, // Slate gray
  GAME_CREATE: 0x8b5cf6, // Violet
  GAME_UPDATE: 0x6366f1, // Indigo
  UPDATE_CREATE: 0x06b6d4, // Cyan
  REPORT_SUBMIT: 0xef4444, // Red
  SETTINGS_UPDATE: 0xf59e0b, // Amber
  PASSWORD_CHANGE: 0xf97316, // Orange
  TERMS_BROADCAST: 0xec4899, // Pink
  SECURITY_ALERT: 0xdc2626, // Crimson
};

export async function logToDiscord(options: LogEventOptions) {
  let logId = "";

  // 1. Persist to AdminAuditLog database table first
  try {
    const audit = await prisma.adminAuditLog.create({
      data: {
        userId: options.userId || null,
        action: options.action,
        title: options.title,
        ipAddress: options.ipAddress || "127.0.0.1",
        details: {
          ...options.details,
          description: options.description,
          userEmail: options.userEmail || null,
          timestamp: new Date().toISOString(),
        },
      },
    });
    logId = audit.id;
  } catch (dbErr) {
    console.error("Failed to save audit log to DB:", dbErr);
    logId = `log-${Date.now()}`;
  }

  // 2. Prepare secret admin-only log URL
  const logUrl = `${APP_URL}/admin/logs/${logId}`;

  // 3. Construct rich Discord Component Embed V2 matching 2nd screenshot
  const embedColor = options.color || ACTION_COLORS[options.action] || 0x2563eb;
  const dateFormatted = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const detailLines: string[] = [];
  if (options.userEmail) {
    detailLines.push(`• **계정 이메일**: \`${options.userEmail}\``);
  }
  if (options.ipAddress) {
    detailLines.push(`• **접속 IP**: \`${options.ipAddress}\``);
  }
  detailLines.push(`• **작업 유형**: \`${options.action}\``);

  if (options.details) {
    Object.entries(options.details)
      .slice(0, 5)
      .forEach(([k, v]) => {
        detailLines.push(`• **${k}**: ${typeof v === "object" ? JSON.stringify(v) : v}`);
      });
  }

  const formattedDescription = [
    options.description ? `${options.description}\n` : "",
    "**상세 파라미터**",
    ...detailLines,
    "",
    `🔒 [관리자 전용 감사 로그 확인하기](${logUrl}) *(비인가 접근 차단)*`,
  ].filter(Boolean).join("\n");

  const discordPayload = {
    username: "NextUps Security Logger",
    avatar_url: `${APP_URL}/logo.png`,
    content: logUrl, // Triggers Discord link preview unrolling for Components V2!
    embeds: [
      {
        author: {
          name: `보안 감사 • ${dateFormatted} • NextUps Security`,
          icon_url: `${APP_URL}/logo.png`,
          url: logUrl,
        },
        title: `[NextUps 로그] ${options.title}`,
        url: logUrl,
        description: formattedDescription,
        color: embedColor,
        thumbnail: {
          url: `${APP_URL}/logo.png`,
        },
        footer: {
          text: `NextUps 보안 감사 시스템 • Log ID: ${logId}`,
          icon_url: `${APP_URL}/logo.png`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
    components: [
      {
        type: 1, // Action Row
        components: [
          {
            type: 2, // Button
            style: 5, // Link Button
            label: "로그 열람하기 ↗",
            url: logUrl,
          },
          {
            type: 2,
            style: 5,
            label: "관리자 대시보드 ↗",
            url: `${APP_URL}/admin/dashboard`,
          },
        ],
      },
    ],
  };

  // 4. Send to Discord Webhook asynchronously
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!res.ok) {
      // If components v2 fail due to webhook permissions, fallback to embeds only
      const text = await res.text();
      console.warn("Discord webhook with components warning, trying fallback:", res.status, text);
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "NextUps Audit Logger",
          avatar_url: `${APP_URL}/logo.png`,
          embeds: discordPayload.embeds,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send Discord log webhook:", error);
  }

  return logId;
}
