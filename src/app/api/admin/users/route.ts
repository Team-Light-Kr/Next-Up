import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logToDiscord } from "@/lib/discord";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { displayName: { contains: search, mode: "insensitive" } },
              { profileCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        profileCode: true,
        twoFactorType: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            follows: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "회원 목록 조회 실패" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, status, displayName } = body;

    if (!userId) {
      return NextResponse.json({ error: "유저 ID가 필요합니다." }, { status: 400 });
    }

    // Prevent admin from demoting or suspending self
    if (userId === admin.id && (status === "SUSPENDED" || role === "USER")) {
      return NextResponse.json({ error: "자기 자신의 관리자 권한을 회수하거나 계정을 정지할 수 없습니다." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "존재하지 않는 회원입니다." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(displayName ? { displayName: displayName.trim() } : {}),
      },
    });

    // Audit logging
    await logToDiscord({
      action: status === "SUSPENDED" ? "USER_SUSPEND" : "USER_UPDATE",
      title: `[회원 관리 변경] ${targetUser.displayName} (${targetUser.email})`,
      description: `관리자 ${admin.displayName}님이 회원 정보를 수정하였습니다. (역할: ${role || targetUser.role}, 상태: ${status || targetUser.status})`,
      userId: admin.id,
      userEmail: admin.email,
      details: {
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        before: { role: targetUser.role, status: targetUser.status },
        after: { role: updated.role, status: updated.status },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ error: "회원 정보 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "유저 ID가 필요합니다." }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: "자기 자신의 계정을 삭제할 수 없습니다." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "존재하지 않는 회원입니다." }, { status: 404 });
    }

    // Soft delete or hard delete based on requirements
    await prisma.user.update({
      where: { id: userId },
      data: { status: "DELETED" },
    });

    await logToDiscord({
      action: "USER_DELETE",
      title: `[회원 계정 삭제/탈퇴 처리] ${targetUser.displayName} (${targetUser.email})`,
      description: `관리자 ${admin.displayName}님이 ${targetUser.email} 계정을 영구 정지/삭제 처리하였습니다.`,
      userId: admin.id,
      userEmail: admin.email,
      details: {
        deletedUserId: targetUser.id,
        deletedUserEmail: targetUser.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "회원 삭제 실패" }, { status: 500 });
  }
}
