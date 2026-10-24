import { NextResponse } from "next/server";
import { getCurrentUser, generateUserTotpSecret } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    let unreadCount = 0;
    try {
      unreadCount = await prisma.notification.count({
        where: { userId: user.id, read: false },
      });
    } catch {
      // ignore notification count error if db connection jitter
    }

    const totpSecret = generateUserTotpSecret(user.id);

    return NextResponse.json(
      {
        authenticated: true,
        user: { ...user, totpSecret },
        unreadNotificationCount: unreadCount,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, user: null },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
