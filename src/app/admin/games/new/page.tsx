"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Gamepad2, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import ImageUploadInput from "@/components/ImageUploadInput";

export default function NewGamePage() {
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
    genresText: "오픈월드, RPG, 액션",
  });

  const [platforms, setPlatforms] = useState<Record<string, { enabled: boolean; version: string; storeUrl: string }>>({
    windows: { enabled: true, version: "v1.0.0", storeUrl: "" },
    playstation: { enabled: false, version: "", storeUrl: "" },
    nintendo: { enabled: false, version: "", storeUrl: "" },
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

      const res = await fetch("/api/admin/games", {
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>게임 목록으로 돌아가기</span>
        </Link>
        <Link
          href="/admin/updates/new"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          패치노트 등록으로 이동 →
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            <span>신규 게임 등록 (관리자)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            공식 개발사 및 플랫폼 정보를 등록하여 실시간 업데이트 추적 대상으로 지정합니다.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                게임 대표명 (Canonical Name) *
              </label>
              <input
                type="text"
                required
                placeholder="예: 원신 (Genshin Impact)"
                value={formData.canonicalName}
                onChange={handleNameChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                고유 식별자 (Slug / URL 경로) *
              </label>
              <input
                type="text"
                required
                placeholder="예: genshin-impact"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                개발사 (Developer)
              </label>
              <input
                type="text"
                placeholder="예: HoYoverse, NEXON Games, Riot Games"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                퍼블리셔 (Publisher)
              </label>
              <input
                type="text"
                placeholder="예: COGNOSPHERE, NEXON"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                공식 웹사이트 URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.officialWebsiteUrl}
                onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <ImageUploadInput
              label="게임 아이콘 파일"
              value={formData.iconUrl}
              onChange={(val) => setFormData({ ...formData, iconUrl: val })}
              aspect="square"
              helpText="정사각형 권장 (기기별 앱 아이콘)"
              maxDimension={256}
            />

            <ImageUploadInput
              label="커버 배경 이미지 파일"
              value={formData.coverImageUrl}
              onChange={(val) => setFormData({ ...formData, coverImageUrl: val })}
              aspect="cover"
              helpText="와이드 가로형 권장 (상세 헤더 배경)"
              maxDimension={1200}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              장르 (쉼표로 구분)
            </label>
            <input
              type="text"
              placeholder="오픈월드, 액션 RPG, 서브컬처, FPS, 샌드박스"
              value={formData.genresText}
              onChange={(e) => setFormData({ ...formData, genresText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              게임 상세 소개 *
            </label>
            <textarea
              required
              rows={4}
              placeholder="게임의 세계관, 주요 시스템 및 개요를 작성합니다."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Platform Settings */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              지원 플랫폼 및 스토어 설정
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["windows", "playstation", "nintendo", "android", "ios", "macos"] as const).map((key) => {
                const p = platforms[key];
                const labels: Record<string, string> = {
                  windows: "Windows",
                  playstation: "PlayStation",
                  nintendo: "Nintendo Switch",
                  android: "Android",
                  ios: "iOS",
                  macos: "macOS",
                };
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      p.enabled
                        ? "border-blue-300 bg-blue-50/20"
                        : "border-slate-200 bg-slate-50/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) =>
                            setPlatforms({
                              ...platforms,
                              [key]: { ...p, enabled: e.target.checked },
                            })
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-xs tracking-wider text-slate-900">
                          {labels[key] || key}
                        </span>
                      </label>
                    </div>

                    {p.enabled && (
                      <div className="space-y-2 mt-3 pt-2 border-t border-slate-200/60">
                        <input
                          type="text"
                          placeholder="최신 버전 (예: v1.0.0)"
                          value={p.version}
                          onChange={(e) =>
                            setPlatforms({
                              ...platforms,
                              [key]: { ...p, version: e.target.value },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white font-mono"
                        />
                        <input
                          type="url"
                          placeholder="스토어/다운로드 URL"
                          value={p.storeUrl}
                          onChange={(e) =>
                            setPlatforms({
                              ...platforms,
                              [key]: { ...p, storeUrl: e.target.value },
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/games"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>게임 정보 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
