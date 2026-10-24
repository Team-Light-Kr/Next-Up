import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { broadcastPrivacyAnnualNotice } from "@/lib/privacy-annual-broadcast";

export async function POST() {
  try {
    const user = await getCurrentUser();
    const isAdmin = user && (user.role === "ADMIN" || user.email === "admin@koharu.live");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다. 시스템 관리자만 연례 법정 공지를 발송할 수 있습니다." },
        { status: 403 }
      );
    }

    const result = await broadcastPrivacyAnnualNotice();

    return NextResponse.json({
      success: true,
      message: `전체 회원 ${result.totalCount}명 대상 연례 개인정보 이용·제공 내역 통지 완료 (성공: ${result.successCount}건, 실패: ${result.failCount}건)`,
      ...result,
    });
  } catch (error: any) {
    console.error("Broadcast privacy history error:", error);
    return NextResponse.json(
      { error: "개인정보 이용내역 안내 메일 발송 실패", detail: error.message },
      { status: 500 }
    );
  }
}
