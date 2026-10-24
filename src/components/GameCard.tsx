import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PlatformBadge from "./PlatformBadge";

interface GameCardProps {
  game: {
    id: string;
    slug: string;
    canonicalName: string;
    description: string;
    iconUrl: string | null;
    coverImageUrl: string | null;
    developer: string | null;
    genres: string[];
    platforms: {
      platform: {
        key: string;
        name: string;
      };
      latestKnownVersion: string | null;
    }[];
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400:border-blue-700 transition-all"
    >
      {/* Cover Banner */}
      <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
        {game.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverImageUrl}
            alt={game.canonicalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Floating icon */}
        <div className="absolute -bottom-3 left-4">
          {game.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.iconUrl}
              alt={game.canonicalName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-md">
              {game.canonicalName.slice(0, 1)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-5">
        <div className="mb-2">
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600:text-blue-400 transition-colors">
            {game.canonicalName}
          </h3>
          <p className="text-xs text-slate-500">
            {game.developer || "공식 개발사"}
          </p>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {game.description}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {game.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Platform Badges */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {game.platforms.map((p) => (
              <PlatformBadge
                key={p.platform.key}
                platformKey={p.platform.key}
                name={p.platform.name}
                size="sm"
              />
            ))}
          </div>

          <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
            상세정보 <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
