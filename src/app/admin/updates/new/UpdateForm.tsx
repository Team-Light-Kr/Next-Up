"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { PlusCircle, FileText, ArrowLeft, AlertCircle, Loader2, Eye, Edit3, Image } from "lucide-react";

interface UpdateFormProps {
  games: { id: string; canonicalName: string; slug: string }[];
  platforms: { id: string; key: string; name: string }[];
}

export default function UpdateForm({ games, platforms }: UpdateFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gameId: games[0]?.id || "",
    platformKey: "windows",
    version: "",
    title: "",
    updateType: "PATCH",
    releaseDate: new Date().toISOString().split("T")[0],
    summary: "",
    sourceName: "공식 홈페이지",
    sourceUrl: "",
    bodyMarkdown: `## 주요 업데이트 내역

### 1. 신규 콘텐츠
- 새로운 이벤트가 시작됩니다.

### 2. 밸런스 조정 및 버그 수정
- 안정성이 개선되었습니다.`,
    imageUrlInput: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddImage = () => {
    if (formData.imageUrlInput.trim() && images.length < 20) {
      setImages([...images, formData.imageUrlInput.trim()]);
      setFormData({ ...formData, imageUrlInput: "" });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "업데이트 등록에 실패했습니다.");
      }

      router.push(`/updates/${data.update.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-blue-600" />
          <span>신규 업데이트 및 패치노트 등록</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          마크다운 서식을 지원하며 최대 20개의 스크린샷 이미지를 첨부할 수 있습니다.
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
              대상 게임 *
            </label>
            <select
              required
              value={formData.gameId}
              onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.canonicalName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              배포 대상 플랫폼 *
            </label>
            <select
              required
              value={formData.platformKey}
              onChange={(e) => setFormData({ ...formData, platformKey: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {platforms.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              버전 명칭 (Version) *
            </label>
            <input
              type="text"
              required
              placeholder="예: v5.4.0, 1.21.50"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              업데이트 유형
            </label>
            <select
              value={formData.updateType}
              onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MAJOR">주요 업데이트 (MAJOR)</option>
              <option value="MINOR">일반 업데이트 (MINOR)</option>
              <option value="PATCH">정기 패치 (PATCH)</option>
              <option value="HOTFIX">긴급 핫픽스 (HOTFIX)</option>
              <option value="NOTICE">점검 및 공지 (NOTICE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              배포 일자 *
            </label>
            <input
              type="date"
              required
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            업데이트 제목 *
          </label>
          <input
            type="text"
            required
            placeholder="예: 5.4 버전 정식 업데이트 안내"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              공식 출처 명칭
            </label>
            <input
              type="text"
              placeholder="예: 공식 홈페이지, Steam 뉴스, Google Play"
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              공식 원문 URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            한 줄 핵심 요약 (Summary)
          </label>
          <input
            type="text"
            placeholder="목록 및 피드에 노출될 1~2줄 핵심 요약"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Markdown Content Editor with Preview Switch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              패치노트 상세 내용 (마크다운 지원) *
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 ${
                  activeTab === "write"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> 편집기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> 미리보기
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <textarea
              required
              rows={12}
              value={formData.bodyMarkdown}
              onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
              className="w-full px-4 py-3 text-sm font-mono rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          ) : (
            <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 min-h-[300px]">
              <MarkdownRenderer content={formData.bodyMarkdown} />
            </div>
          )}
        </div>

        {/* Image Attachment Section (Up to 20 images) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            패치 이미지 첨부 (최대 20개, 현재 {images.length}/20)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://... (이미지 주소)"
              value={formData.imageUrlInput}
              onChange={(e) => setFormData({ ...formData, imageUrlInput: e.target.value })}
              className="flex-1 px-3.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
            />
            <button
              type="button"
              onClick={handleAddImage}
              disabled={images.length >= 20 || !formData.imageUrlInput.trim()}
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-50"
            >
              추가
            </button>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs border border-slate-200"
                >
                  <Image className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[140px]">{img}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-red-500 font-bold ml-1 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
            <span>업데이트 발행하기</span>
          </button>
        </div>
      </form>
    </div>
  );
}
