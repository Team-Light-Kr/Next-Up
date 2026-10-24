import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runDataCollection } from "@/lib/collector";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const isAdmin =
      user &&
      (user.role === "ADMIN" ||
        user.email === "admin@koharu.live" ||
        user.email === "admin@nextups.xyz");
    if (!isAdmin) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { source = "STEAM_OFFICIAL_FEED" } = await request.json().catch(() => ({}));
    const result = await runDataCollection(source);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Collector trigger error:", error);
    return NextResponse.json({ error: "수집기 실행 실패", detail: error.message }, { status: 500 });
  }
}
