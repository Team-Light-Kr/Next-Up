"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GitCompare,
  ArrowRightLeft,
  ChevronDown,
  Search,
  Check,
  Gamepad2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export interface UpdateItem {
  id: string;
  version: string;
  title: string;
  releaseDate: string | Date;
  game: {
    canonicalName: string;
    iconUrl?: string | null;
    slug?: string;
  };
  platform: {
    name: string;
  };
}

interface CompareSelectorProps {
  updates: UpdateItem[];
  initialLeftId?: string;
  initialRightId?: string;
}

export default function CompareSelector({
  updates,
  initialLeftId = "",
  initialRightId = "",
}: CompareSelectorProps) {
  const router = useRouter();
  const [leftId, setLeftId] = useState(initialLeftId);
  const [rightId, setRightId] = useState(initialRightId);

  // Group updates by game
  const groupedGames = useMemo(() => {
    const map: Record<string, { gameName: string; iconUrl?: string | null; items: UpdateItem[] }> = {};
    for (const u of updates) {
      const gName = u.game.canonicalName;
      if (!map[gName]) {
        map[gName] = {
          gameName: gName,
          iconUrl: u.game.iconUrl,
          items: [],
        };
      }
      map[gName].items.push(u);
    }
    // Sort games alphabetically
    return Object.values(map).sort((a, b) => a.gameName.localeCompare(b.gameName, "ko-KR"));
  }, [updates]);

  const handleSwap = () => {
    const temp = leftId;
    setLeftId(rightId);
    setRightId(temp);
  };

  const handleCompare = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!leftId || !rightId) {
      alert("비교할 두 개 버전을 모두 선택해 주세요.");
      return;
    }
    router.push(`/compare?left=${encodeURIComponent(leftId)}&right=${encodeURIComponent(rightId)}`);
  };

  const selectedLeft = updates.find((u) => u.id === leftId);
  const selectedRight = updates.find((u) => u.id === rightId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>비교할 패치 버전 선택</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            게임별로 정렬된 패치 목록에서 이전 버전과 신규 버전을 선택해 차이점을 분석하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          disabled={!leftId && !rightId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
          title="비교 대상 좌우 전환"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>A ↔ B 순서 바꾸기</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Selector A (Left) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            비교 대상 A <span className="text-slate-400 font-normal">(이전 기준 버전)</span>
          </label>
          <div className="relative">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-slate-50/70 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">비교할 이전 버전을 선택하세요...</option>
              {groupedGames.map((group) => (
                <optgroup key={group.gameName} label={`[게임] ${group.gameName}`}>
                  {group.items.map((u) => {
                    const dateStr = new Date(u.releaseDate).toLocaleDateString("ko-KR");
                    return (
                      <option key={u.id} value={u.id}>
                        {group.gameName} ({u.platform.name}) • v{u.version} - {u.title} ({dateStr})
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedLeft && (
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">{selectedLeft.game.canonicalName}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold">
                  v{selectedLeft.version}
                </span>
                <span className="text-slate-500 text-[11px]">{selectedLeft.platform.name}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(selectedLeft.releaseDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
          )}
        </div>

        {/* Selector B (Right) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            비교 대상 B <span className="text-slate-400 font-normal">(이후 신규 버전)</span>
          </label>
          <div className="relative">
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-slate-50/70 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">비교할 이후 버전을 선택하세요...</option>
              {groupedGames.map((group) => (
                <optgroup key={group.gameName} label={`[게임] ${group.gameName}`}>
                  {group.items.map((u) => {
                    const dateStr = new Date(u.releaseDate).toLocaleDateString("ko-KR");
                    return (
                      <option key={u.id} value={u.id}>
                        {group.gameName} ({u.platform.name}) • v{u.version} - {u.title} ({dateStr})
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedRight && (
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900">{selectedRight.game.canonicalName}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[11px] font-bold">
                  v{selectedRight.version}
                </span>
                <span className="text-slate-500 text-[11px]">{selectedRight.platform.name}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {new Date(selectedRight.releaseDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => handleCompare()}
          disabled={!leftId || !rightId}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <GitCompare className="w-4 h-4" />
          <span>두 버전 상세 비교하기</span>
        </button>
      </div>
    </div>
  );
}
