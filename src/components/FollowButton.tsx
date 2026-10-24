"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

interface FollowButtonProps {
  gameSlug: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ gameSlug, initialFollowing = false }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const res = await fetch(`/api/games/${gameSlug}/follow`, {
        method: "POST",
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        following
          ? "bg-rose-50 border border-rose-200 text-rose-600"
          : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
      }`}
      title={following ? "관심 게임 해제" : "관심 게임 등록"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Heart
          className={`w-3.5 h-3.5 ${
            following ? "fill-rose-500 text-rose-500" : "text-slate-400"
          }`}
        />
      )}
      <span>{following ? "관심 등록됨" : "관심 등록"}</span>
    </button>
  );
}
