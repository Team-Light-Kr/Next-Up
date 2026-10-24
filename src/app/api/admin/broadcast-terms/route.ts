import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { broadcastTermsToAllUsers } from "@/lib/terms-broadcast";

export async function POST() {
  const user = await getCurrentUser();
  const isAdmin =
    user && (user.role === "ADMIN" || user.email === "admin@koharu.live");

  if (!isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const result = await broadcastTermsToAllUsers();
  return NextResponse.json({
    success: true,
    message: `전체 회원 ${result.delivered}/${result.total}명에게 약관 개정 안내 메일 발송을 완료했습니다.`,
    ...result,
  });
}
