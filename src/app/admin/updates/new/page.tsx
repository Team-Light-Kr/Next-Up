import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import UpdateForm from "./UpdateForm";
import { ArrowLeft } from "lucide-react";

export default async function NewUpdatePage() {
  const [games, platforms] = await Promise.all([
    prisma.game.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, canonicalName: true, slug: true },
      orderBy: { canonicalName: "asc" },
    }),
    prisma.platform.findMany({
      select: { id: true, key: true, name: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로 돌아가기</span>
        </Link>
        <Link
          href="/admin/games/new"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          신규 게임 등록으로 이동 →
        </Link>
      </div>

      <UpdateForm games={games} platforms={platforms} />
    </div>
  );
}
