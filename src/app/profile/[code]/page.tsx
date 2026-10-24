import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import GameCard from "@/components/GameCard";
import { User, ShieldCheck, Heart, Settings, Calendar, ExternalLink, Share2 } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { code } = await params;

  const profileUser = await prisma.user.findUnique({
    where: { profileCode: code },
    include: {
      follows: {
        include: {
          game: {
            include: {
              platforms: {
                include: {
                  platform: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === profileUser.id;

  const joinDate = new Date(profileUser.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {profileUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.displayName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {profileUser.displayName.slice(0, 2)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {profileUser.displayName}
                </h1>
                {profileUser.role === "ADMIN" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    관리자
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span>프로필 코드:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {profileUser.profileCode}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> {joinDate} 가입
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isOwner && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50:bg-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>프로필 및 2FA 설정</span>
              </Link>
            )}
          </div>
        </div>

        {/* Custom Bio */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            소개 한마디
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {profileUser.bio || "작성된 소개글이 없습니다. 설정에서 프로필을 꾸며보세요!"}
          </p>
        </div>
      </div>

      {/* Followed Games Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>관심 게임 목록</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              관심 등록한 게임에 새 업데이트가 출시되면 알림을 받아봅니다. (총 {profileUser.follows.length}개)
            </p>
          </div>
          <Link
            href="/games"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            게임 더 탐색하기 →
          </Link>
        </div>

        {profileUser.follows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profileUser.follows.map((follow) => (
              <GameCard key={follow.id} game={follow.game as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">
              아직 관심 등록한 게임이 없습니다
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              자주 플레이하는 게임을 관심 등록해 두시면 패치 뉴스를 빠르게 확인하실 수 있습니다.
            </p>
            <Link
              href="/games"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              게임 목록 보러가기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
