import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET || "nextup-super-secure-secret-key-2025-team-light";

// Fast web-crypto HMAC SHA-256 verifier for edge/middleware runtime
async function verifyToken(token: string) {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // base64url decode signature
    const sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const sigBuf = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuf,
      enc.encode(data)
    );

    if (!isValid) return null;

    const payloadJson = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security Headers for all requests
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Admin route protection: strict guard
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("nextup_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(sessionCookie);
    if (!payload || payload.role !== "ADMIN") {
      // 403 Forbidden page redirect or blocked response
      return new NextResponse(
        JSON.stringify({
          error: "403 Forbidden",
          message: "관리자 전용 구역입니다. 접근 권한이 없습니다.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Games creation route protection (requires logged in user)
  if (pathname === "/games/new") {
    const sessionCookie = request.cookies.get("nextup_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyToken(sessionCookie);
    if (!payload) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/games/new",
    "/settings",
    "/notifications",
  ],
};
