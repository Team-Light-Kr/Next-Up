"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gamepad2, ArrowLeft, Loader2, AlertCircle, Plus } from "lucide-react";

export default function MemberNewGamePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    canonicalName: "",
    slug: "",
    developer: "",
    publisher: "",
    officialWebsiteUrl: "",
    iconUrl: "",
    coverImageUrl: "",
    description: "",
    genresText: "",
  });

  const [platforms, setPlatforms] = useState<Record<string, { enabled: boolean; version: string; storeUrl: string }>>({
    windows: { enabled: true, version: "v1.0.0", storeUrl: "" },
    android: { enabled: false, version: "", storeUrl: "" },
    ios: { enabled: false, version: "", storeUrl: "" },
    macos: { enabled: false, version: "", storeUrl: "" },
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      canonicalName: name,
      slug: prev.slug ? prev.slug : generatedSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const selectedPlatforms = Object.entries(platforms)
        .filter(([_, v]) => v.enabled)
        .map(([key, v]) => ({
          platformKey: key,
          latestKnownVersion: v.version,
          storeUrl: v.storeUrl,
        }));

      const genres = formData.genresText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/games/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          genres,
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "게임 등록에 실패했습니다.");
      }

      router.push(`/games/${formData.slug}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <Link
        href="/games"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>게임 디렉터리로 돌아가기</span>
      </Link>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <span>신규 게임 등록</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            업데이트 소식을 공유하고 추적할 게임 정보를 등록해 주세요.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                게임 이름 *
              </label>
              <input
                type="text"
                required
                placeholder="예: 스타크래프트 리마스터"
                value={formData.canonicalName}
                onChange={handleNameChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                영문 고유 식별자 (Slug) *
              </label>
              <input
                type="text"
                required
                placeholder="예: starcraft-remastered"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                개발사
              </label>
              <input
                type="text"
                placeholder="예: Blizzard Entertainment"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                장르 (쉼표로 구분)
              </label>
              <input
                type="text"
                placeholder="RTS, 전략, 액션"
                value={formData.genresText}
                onChange={(e) => setFormData({ ...formData, genresText: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                공식 홈페이지
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.officialWebsiteUrl}
                onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                아이콘 이미지 URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                커버 이미지 URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              게임 소개 *
            </label>
            <textarea
              required
              rows={4}
              placeholder="게임에 대한 간단한 소개를 작성해 주세요."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Platforms selection */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <span className="text-xs font-semibold text-neutral-900">
              지원 플랫폼 선택
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["windows", "android", "ios", "macos"] as const).map((key) => {
                const p = platforms[key];
                return (
                  <label
                    key={key}
                    className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                      p.enabled
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 font-semibold"
                        : "border-neutral-200 text-neutral-500"
                    }`}
                  >
                    <span className="uppercase">{key}</span>
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={(e) =>
                        setPlatforms({
                          ...platforms,
                          [key]: { ...p, enabled: e.target.checked },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Link
              href="/games"
              className="px-4 py-2 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>게임 등록하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
