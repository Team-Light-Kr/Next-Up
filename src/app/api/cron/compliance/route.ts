import { NextResponse } from "next/server";
import { broadcastPrivacyAnnualNotice } from "@/lib/privacy-annual-broadcast";
import { broadcastTermsToAllUsers } from "@/lib/terms-broadcast";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [privacyResult, termsResult] = await Promise.all([
      broadcastPrivacyAnnualNotice().catch((err) => ({ error: err.message })),
      broadcastTermsToAllUsers().catch((err) => ({ error: err.message })),
    ]);

    return NextResponse.json({
      success: true,
      message: "법정 의무 공지 및 약관 개정 안내 자동 발송 배치 작업 완료",
      privacyResult,
      termsResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Compliance cron failure:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
