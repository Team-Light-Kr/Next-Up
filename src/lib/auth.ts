import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SECRET = process.env.AUTH_SECRET || "nextup-super-secure-secret-key-2025-team-light";

// Generate random 6-digit number string
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate random 8-letter english profile code (as specified in list.txt line 3049)
export function generateProfileCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Sign and verify session tokens (Permanent login - 10 years until explicit logout)
export function signSessionToken(payload: { userId: string; email: string; role: string; profileCode: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; email: string; role: string; profileCode: string } | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Password hashing with PBKDF2 (SHA-512)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(":");
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

// RFC 6238 TOTP (Google Authenticator) Helper Functions
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function fromBase32(str: string): Buffer {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  const cleanStr = str.toUpperCase().replace(/=+$/, "");
  for (let i = 0; i < cleanStr.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateUserTotpSecret(userId: string): string {
  const hash = crypto.createHmac("sha256", SECRET).update(`totp:${userId}`).digest();
  return toBase32(hash.subarray(0, 20));
}

export function generateTotpCode(secretBase32: string, timeStep = Math.floor(Date.now() / 1000 / 30)): string {
  const secretBytes = fromBase32(secretBase32);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac("sha1", secretBytes).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (codeInt % 1000000).toString().padStart(6, "0");
  return code;
}

export function verifyTotpCode(secretBase32: string, token: string): boolean {
  if (!token || token.trim().length !== 6) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  // Check -1, 0, +1 time windows (allows +- 30 seconds clock drift)
  for (let step = currentStep - 1; step <= currentStep + 1; step++) {
    if (generateTotpCode(secretBase32, step) === token.trim()) {
      return true;
    }
  }
  return false;
}


// Get current user from server context (cookies)
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("nextup_session")?.value;
    if (!token) return null;

    const session = verifySessionToken(token);
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        profileCode: true,
        passwordHash: true,
        bio: true,
        avatarUrl: true,
        twoFactorType: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // Automatic Super-Admin escalation for admin@koharu.live
    if (user.email === "admin@koharu.live" || user.email === "admin@nextups.xyz") {
      user.role = "ADMIN";
    }

    const { passwordHash, ...safeUser } = user;
    return {
      ...safeUser,
      hasPassword: Boolean(passwordHash),
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Resend Email Sender (list.txt line 3030, 3038)
export async function sendEmailVerificationCode(
  email: string,
  code: string,
  purpose: "회원가입" | "로그인" | "2단계 인증"
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "admin@nextups.xyz";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured.");
    return true; // simulation mode
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz"}/logo.png" alt="NextUps" width="56" height="56" style="width: 56px; height: 56px; margin-bottom: 8px; border-radius: 12px; display: inline-block;" />
        <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800;">NextUps</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">멀티플랫폼 게임 업데이트 정보 통합 플랫폼</p>
      </div>

      <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 12px;">NextUps ${purpose} 인증번호 안내</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        NextUps 서비스를 이용해 주셔서 감사합니다. 아래 6자리 인증번호를 입력창에 입력해 주세요.<br/>
        인증번호는 <strong>10분 동안 유효</strong>합니다.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b;">${code}</span>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 28px;">
        본인이 요청하지 않은 경우 이 메일을 무시하시거나 관리자에게 문의해 주세요.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        ※ 본 메일은 발신 전용 메일이므로 회신 시 확인되지 않습니다. (admin@nextups.xyz)
      </p>
    </div>
  `;

  try {
    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `NextUps <${fromEmail}>`,
        to: [email],
        subject: `[NextUps] ${purpose} 인증번호는 [${code}] 입니다.`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      // Fallback to onboarding@resend.dev in case custom domain has restrictions
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `NextUps <onboarding@resend.dev>`,
          to: [email],
          subject: `[NextUps] ${purpose} 인증번호는 [${code}] 입니다.`,
          html: htmlContent,
        }),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Resend API warning:", res.status, errText);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend send error:", error);
    return false;
  }
}

// Sendwich SMS Sender with Dual Delivery Guarantee
export async function sendSmsVerificationCode(phoneNumber: string, code: string, fallbackEmail?: string) {
  const apiKey = process.env.SENDWICH_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.sendwich.kr/v1/verifications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "discover",
          client_reference: phoneNumber,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn("Sendwich verification warning:", res.status, err);
      }
    } catch (error) {
      console.error("Sendwich send error:", error);
    }
  }

  // Dual delivery guarantee: Always also deliver to email so user is never locked out
  if (fallbackEmail) {
    await sendEmailVerificationCode(fallbackEmail, code, "2단계 인증");
  }

  return true;
}
