import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PlatformBadge from "@/components/PlatformBadge";
import FollowButton from "@/components/FollowButton";
import ReportModal from "@/components/ReportModal";
import EditGameModal from "@/components/EditGameModal";
import { getCurrentUser } from "@/lib/auth";
import {
  ExternalLink,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Globe,
  Building2,
  Tag,
  AlertCircle,
  Clock,
  History,
  Download,
} from "lucide-react";

import { getFastGameBySlug } from "@/lib/games-cache";
import { buildGameEmbed, toComponentEmbedJson } from "@/lib/discord-component-embed";

export const dynamic = "force-dynamic";

interface GameDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: GameDetailPageProps) {
  const rawSlug = (await params).slug || "";
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {}

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

  try {
    const game = await prisma.game.findFirst({
      where: {
        OR: [{ slug: decodedSlug }, { slug: rawSlug }, { canonicalName: decodedSlug }],
      },
      include: {
        updates: {
          orderBy: { releaseDate: "desc" },
          take: 1,
        },
      },
    });

    if (!game) return { title: "NextUps" };

    const title = `${game.canonicalName} 패치노트 및 업데이트 정보`;
    const latestVersion = game.updates[0]?.version ? ` (최신 v${game.updates[0].version})` : "";
    const desc = game.description || `${game.canonicalName}의 공식 실시간 패치 정보${latestVersion}`;
    const card = buildGameEmbed(game, game.updates[0]?.version, appUrl);
    const embedJson = toComponentEmbedJson(card);

    return {
      title,
      description: desc,
      other: {
        "discord:component-embed": embedJson,
      },
      openGraph: {
        title,
        description: desc,
        url: `${appUrl}/games/${game.slug}`,
        images: [game.iconUrl || `${appUrl}/logo.png`],
      },
    };
  } catch {
    return { title: "NextUps" };
  }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const rawSlug = (await params).slug || "";
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch {}

  let game: any = null;
  let isFollowing = false;
  let currentUser: any = null;
  let canManage = false;

  try {
    currentUser = await getCurrentUser();
    canManage = Boolean(currentUser);

    // 1. DB에서 Slug / ID / 한글명 매칭 조회
    game = await prisma.game.findUnique({
      where: { slug: decodedSlug },
      include: {
        platforms: {
          include: {
            platform: true,
          },
        },
        updates: {
          orderBy: { releaseDate: "desc" },
          include: {
            platform: true,
          },
        },
      },
    });

    if (!game) {
      game = await prisma.game.findFirst({
        where: {
          OR: [
            { slug: rawSlug },
            { id: decodedSlug },
            { id: rawSlug },
            { canonicalName: decodedSlug },
          ],
        },
        include: {
          platforms: {
            include: {
              platform: true,
            },
          },
          updates: {
            orderBy: { releaseDate: "desc" },
            include: {
              platform: true,
            },
          },
        },
      });
    }

    if (game && currentUser) {
      const follow = await prisma.gameFollow.findFirst({
        where: { userId: currentUser.id, gameId: game.id },
      });
      isFollowing = Boolean(follow);
    }
  } catch (error) {
    console.error("GameDetailPage query error:", error);
  }

  if (!game) {
    notFound();
  }

  const discordCard = buildGameEmbed(game, game.updates?.[0]?.version);
  const discordJson = toComponentEmbedJson(discordCard);

  return (
    <div className="pb-16 space-y-10">
      <script
        id="discord:component-embed"
        type="application/vnd.discord.component-embed+json"
        dangerouslySetInnerHTML={{
          __html: discordJson,
        }}
      />
      {/* Game Header Banner */}
      <section className="relative bg-white text-slate-900 overflow-hidden border-b border-slate-200">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Game Icon */}
            {game.iconUrl ? (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-slate-200 shadow-sm bg-slate-900 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.iconUrl}
                  alt={game.canonicalName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-3xl border border-slate-200 shadow-sm shrink-0">
                {game.canonicalName.slice(0, 1)}
              </div>
            )}

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  공식 등록 타이틀
                </span>
                {game.genres.map((g: string) => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {game.canonicalName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                {game.developer && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>개발: {game.developer}</span>
                  </div>
                )}
                {game.publisher && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>퍼블리셔: {game.publisher}</span>
                  </div>
                )}
                {game.officialWebsiteUrl && (
                  <a
                    href={game.officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    <span>공식 홈페이지</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Action Buttons: Follow, Report, and EditGameModal */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <FollowButton gameSlug={game.slug} initialFollowing={isFollowing} />
                <ReportModal gameId={game.id} targetName={game.canonicalName} />
                <EditGameModal game={game} canManage={canManage} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Game Description */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-2">
            게임 소개
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {game.description}
          </p>
        </section>

        {/* Platform Status Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>지원 플랫폼 및 최신 버전 현황</span>
            </h2>
            <span className="text-xs text-slate-500">
              총 {game.platforms.length}개 플랫폼 지원
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {game.platforms.map((gp: any) => (
              <div
                key={gp.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <PlatformBadge platformKey={gp.platform.key} name={gp.platform.name} size="md" />
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {gp.availabilityStatus === "AVAILABLE" ? "지원 중" : gp.availabilityStatus}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">
                      최신 확인 버전
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-900">
                      {gp.latestKnownVersion || "정보 없음"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {gp.storeUrl ? (
                    <a
                      href={gp.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors w-full justify-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>스토어 및 공식 설치</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">스토어 링크 준비 중</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Update History Timeline */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>업데이트 및 패치 이력</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                해당 게임의 플랫폼별 공식 릴리스 타임라인입니다.
              </p>
            </div>
            <Link
              href="/admin/updates/new"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              + 패치 등록
            </Link>
          </div>

          {game.updates.length > 0 ? (
            <div className="space-y-4">
              {game.updates.map((update: any) => {
                const dateStr = new Date(update.releaseDate).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <article
                    key={update.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <PlatformBadge platformKey={update.platform.key} name={update.platform.name} size="sm" />
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {update.version}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateStr}
                        </span>
                        {update.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> 공식
                          </span>
                        )}
                      </div>

                      <Link href={`/updates/${update.id}`}>
                        <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {update.title}
                        </h3>
                      </Link>

                      {update.summary && (
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {update.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      {update.sourceUrl && (
                        <a
                          href={update.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                        >
                          <span>{update.sourceName || "공식 원문"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      <Link
                        href={`/updates/${update.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <span>패치노트 전문</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                아직 등록된 업데이트 기록이 없습니다
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
