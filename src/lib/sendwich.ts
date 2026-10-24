import crypto from "crypto";

const SENDWICH_API_BASE = "https://api.sendwich.kr/v1";

export interface SendwichVerification {
  id: string;
  status: "pending" | "verified" | "expired" | "canceled" | string;
  destination: string;
  sms_text: string;
  verification_url: string;
  expires_at: string;
  phone?: string | null;
}

/**
 * 샌드위치(Sendwich) SMS 인증 세션 생성
 * 사용자가 destination 번호로 sms_text 문자를 전송하는 MO(Mobile-Originated) 방식
 */
export async function createSendwichVerification(options: {
  expectedPhone?: string;
  clientReference?: string;
}): Promise<SendwichVerification | null> {
  const apiKey = process.env.SENDWICH_API_KEY;
  if (!apiKey) {
    console.warn("[Sendwich] API Key is not configured.");
    return null;
  }

  const cleanPhone = options.expectedPhone?.replace(/[^0-9]/g, "");
  const isMatchMode = Boolean(cleanPhone && cleanPhone.startsWith("010") && cleanPhone.length === 11);

  const payload: Record<string, any> = {
    mode: isMatchMode ? "match" : "discover",
    client_reference: options.clientReference || `user_${Date.now()}`,
  };

  if (isMatchMode) {
    payload.expected_phone = cleanPhone;
  }

  const idempotencyKey = `idemp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  try {
    const res = await fetch(`${SENDWICH_API_BASE}/verifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": idempotencyKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Sendwich] Create verification failed:", res.status, errText);
      return null;
    }

    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      destination: data.destination,
      sms_text: data.sms_text,
      verification_url: data.verification_url,
      expires_at: data.expires_at,
      phone: data.phone,
    };
  } catch (error) {
    console.error("[Sendwich] Request error:", error);
    return null;
  }
}

/**
 * 샌드위치(Sendwich) 인증 완료 여부 실시간 조회
 */
export async function checkSendwichStatus(verificationId: string): Promise<{
  verified: boolean;
  status: string;
  phone?: string | null;
}> {
  const apiKey = process.env.SENDWICH_API_KEY;
  if (!apiKey || !verificationId) {
    return { verified: false, status: "missing_api_key_or_id" };
  }

  try {
    const res = await fetch(`${SENDWICH_API_BASE}/verifications/${verificationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { verified: false, status: `http_${res.status}` };
    }

    const data = await res.json();
    return {
      verified: data.status === "verified",
      status: data.status,
      phone: data.phone,
    };
  } catch (error) {
    console.error("[Sendwich] Check status error:", error);
    return { verified: false, status: "error" };
  }
}
