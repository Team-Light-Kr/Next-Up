import { NextResponse } from "next/server";
import { checkSendwichStatus } from "@/lib/sendwich";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (!id) {
    return NextResponse.json({ error: "인증 ID가 필요합니다." }, { status: 400 });
  }

  const result = await checkSendwichStatus(id);

  if (result.verified && email) {
    // 샌드위치 인증이 완료되면 해당 이메일에 대해 검증 완료된 코드를 DB에 기록하여 가입/로그인 통과 처리
    try {
      await prisma.verificationCode.create({
        data: {
          email: email.trim().toLowerCase(),
          code: id, // 인증 ID 자체를 검증 코드로 인정
          purpose: "VERIFY",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          used: false,
        },
      });
    } catch {}
  }

  return NextResponse.json(result);
}
