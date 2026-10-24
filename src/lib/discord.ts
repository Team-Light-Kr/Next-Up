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

const DEFAULT_APP_URL = "https://www.nextups.xyz";

/**
 * Ensures that any URL sent to Discord webhooks starts with https://www.nextups.xyz
 * Discordbot fails to unfurl redirects or localhost, so www. is strictly required.
 */
export function ensureWwwUrl(url?: string | null): string {
  if (!url) return DEFAULT_APP_URL;

  // 1. Relative paths
  if (url.startsWith("/")) {
    return `${DEFAULT_APP_URL}${url}`;
  }

  // 2. Replace localhost or 127.0.0.1
  let normalized = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, DEFAULT_APP_URL);

  // 3. Replace non-www nextups.xyz with www.nextups.xyz
  normalized = normalized.replace(/^https?:\/\/nextups\.xyz/, DEFAULT_APP_URL);

  // 4. If starts with nextups.xyz or www.nextups.xyz without protocol
  if (normalized.startsWith("nextups.xyz")) {
    normalized = `https://www.${normalized}`;
  } else if (normalized.startsWith("www.nextups.xyz")) {
    normalized = `https://${normalized}`;
  }

  // 5. Canonicalize any lingering nextups.xyz hostname to www.nextups.xyz
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname === "nextups.xyz") {
      parsed.hostname = "www.nextups.xyz";
      return parsed.toString();
    }
  } catch {
    // fallback
  }

  return normalized;
}

const APP_URL = ensureWwwUrl(process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL);

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
  hideButtons?: boolean;
  targetUrl?: string;
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
  const targetUrl = ensureWwwUrl(options.targetUrl || logUrl);

  // 3. Send using Link Transmission Format so Discord unfurls Component Embed V2!
  const discordPayload = {
    username: "NextUps Security Logger",
    avatar_url: `${APP_URL}/logo.png`,
    content: targetUrl,
  };

  // 4. Send to Discord Webhook asynchronously
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!res.ok) {
      console.warn("Discord webhook notification returned status:", res.status);
    }
  } catch (error) {
    console.error("Failed to send Discord log webhook:", error);
  }

  return logId;
}
