"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
  FileText,
  AlertCircle,
  Loader2,
  Eye,
  Edit3,
  Image as ImageIcon,
  Upload,
  X,
  Monitor,
  Smartphone,
  Apple,
  Laptop,
  Gamepad2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
} from "lucide-react";

interface UpdateFormProps {
  games: { id: string; canonicalName: string; slug: string }[];
  platforms: { id?: string; key: string; name: string }[];
}

export default function UpdateForm({ games: initialGames, platforms: initialPlatforms }: UpdateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [games, setGames] = useState(initialGames);
  const [formData, setFormData] = useState({
    gameId: initialGames[0]?.id || "",
    platformKey: "windows",
    version: "",
    title: "",
    updateType: "PATCH",
    releaseDate: new Date().toISOString().split("T")[0],
    summary: "",
    sourceName: "공식 홈페이지",
    sourceUrl: "",
    bodyMarkdown: `## 주요 업데이트 내역

### 1. 신규 콘텐츠 및 기능
- 새로운 콘텐츠가 추가되었습니다.

### 2. 밸런스 조정 및 버그 수정
- 시스템 안정성이 대폭 개선되었습니다.`,
  });

  const [images, setImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side fallback to guarantee game list is never empty
  useEffect(() => {
    if (games.length === 0) {
      fetch("/api/search?q=")
        .then((res) => res.json())
        .then((data) => {
          if (data.games && data.games.length > 0) {
            const mapped = data.games.map((g: any) => ({
              id: g.id,
              canonicalName: g.canonicalName,
              slug: g.slug,
            }));
            setGames(mapped);
            if (!formData.gameId) {
              setFormData((prev) => ({ ...prev, gameId: mapped[0].id }));
            }
          }
        })
        .catch(() => {});
    }
  }, [games.length, formData.gameId]);

  // Insert image directly into markdown at current cursor position
  const insertImageToMarkdown = (dataUrl: string, altText = "스크린샷") => {
    const textarea = textareaRef.current;
    const markdownImg = `\n\n![${altText}](${dataUrl})\n\n`;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.bodyMarkdown;
      const newText = text.substring(0, start) + markdownImg + text.substring(end);
      setFormData({ ...formData, bodyMarkdown: newText });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdownImg.length, start + markdownImg.length);
      }, 50);
    } else {
      setFormData({
        ...formData,
        bodyMarkdown: formData.bodyMarkdown + markdownImg,
      });
    }
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
    } catch (e) {
      console.error("Upload error:", e);
    }
    return null;
  };

  const handleInlineImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = await uploadImageFile(file);
    if (url) {
      insertImageToMarkdown(url, file.name.replace(/\.[^/.]+$/, ""));
      setImages((prev) => (prev.length < 20 ? [...prev, url] : prev));
    }
    e.target.value = "";
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = await uploadImageFile(file);
      if (url) {
        setImages((prev) => (prev.length < 20 ? [...prev, url] : prev));
      }
    }
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gameId) {
      setErrorMsg("대상 게임을 선택해 주세요. 게임이 등록되어 있지 않다면 먼저 게임을 등록해야 합니다.");
      return;
    }

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

  const platformButtons = [
    { key: "windows", name: "Windows", icon: Monitor, color: "text-blue-600", activeBg: "bg-blue-50 border-blue-600 text-blue-700" },
    { key: "playstation", name: "PlayStation", icon: Gamepad2, color: "text-indigo-600", activeBg: "bg-indigo-50 border-indigo-600 text-indigo-700" },
    { key: "nintendo", name: "Nintendo Switch", icon: Gamepad2, color: "text-red-600", activeBg: "bg-red-50 border-red-600 text-red-700" },
    { key: "android", name: "Android", icon: Smartphone, color: "text-emerald-600", activeBg: "bg-emerald-50 border-emerald-600 text-emerald-700" },
    { key: "ios", name: "iOS", icon: Apple, color: "text-slate-900", activeBg: "bg-slate-100 border-slate-900 text-slate-900" },
    { key: "macos", name: "macOS", icon: Laptop, color: "text-purple-600", activeBg: "bg-purple-50 border-purple-600 text-purple-700" },
  ];

  const updateTypes = [
    { key: "PATCH", label: "정기 패치 (PATCH)", color: "border-blue-300 text-blue-700 bg-blue-50/50" },
    { key: "MAJOR", label: "대규모 업데이트 (MAJOR)", color: "border-purple-300 text-purple-700 bg-purple-50/50" },
    { key: "HOTFIX", label: "긴급 핫픽스 (HOTFIX)", color: "border-red-300 text-red-700 bg-red-50/50" },
    { key: "NOTICE", label: "공지 및 점검 (NOTICE)", color: "border-amber-300 text-amber-700 bg-amber-50/50" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-7">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-blue-600" />
          <span>신규 업데이트 및 패치노트 등록</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          마크다운 서식을 지원하며 본문 어디든 이미지를 자유롭게 삽입하고 미리보기로 실시간 확인할 수 있습니다.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Game Selection & Platform Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Custom Modern Game Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                대상 게임 <span className="text-red-500">*</span>
              </label>
              <Link href="/admin/games/new" className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5">
                <Plus className="w-3 h-3" /> 신규 게임 등록
              </Link>
            </div>

            {games.length > 0 ? (
              <div className="relative">
                <select
                  required
                  value={formData.gameId}
                  onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                  className="w-full appearance-none pl-3.5 pr-10 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id} className="py-1">
                      {g.canonicalName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-amber-800 text-xs flex items-center justify-between">
                <span>등록된 게임이 없습니다.</span>
                <Link href="/admin/games/new" className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700">
                  게임 등록하기
                </Link>
              </div>
            )}
          </div>

          {/* Platform Button Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              배포 대상 플랫폼 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {platformButtons.map((p) => {
                const Icon = p.icon;
                const isSelected = formData.platformKey === p.key;
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => setFormData({ ...formData, platformKey: p.key })}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? `${p.activeBg} ring-2 ring-blue-500 shadow-xs`
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${p.color}`} />
                    <span className="text-[11px]">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Version, Update Type, Release Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              버전 명칭 (Version) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: v5.4.0, 1.21.50"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              업데이트 유형 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.updateType}
                onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                className="w-full appearance-none pl-3.5 pr-10 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {updateTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              배포 및 릴리스 일자 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* 3. Title & Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            업데이트 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="예: 2026 신규 시즌 업데이트 및 주요 밸런스 패치"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            한 줄 핵심 요약 (Summary)
          </label>
          <input
            type="text"
            placeholder="목록 및 알림에 노출될 한 줄 요약을 작성하세요."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* 4. Markdown Editor with Free Image Placement & Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold text-slate-700">
                패치노트 상세 본문 (마크다운) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                본문 어디든 이미지를 자유롭게 삽입할 수 있습니다
              </span>
            </div>

            {/* Actions: Inline Image Insert & Tab Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inlineImageInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                title="본문 커서 위치에 이미지 바로 삽입"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>본문 이미지 삽입</span>
              </button>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleInlineImageSelect}
                className="hidden"
              />

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "write"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>작성하기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>실시간 미리보기</span>
                </button>
              </div>
            </div>
          </div>

          {activeTab === "write" ? (
            <textarea
              ref={textareaRef}
              required
              rows={14}
              value={formData.bodyMarkdown}
              onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
              className="w-full p-4 text-sm font-mono leading-relaxed rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="마크다운 형식으로 상세 패치노트를 작성하세요..."
            />
          ) : (
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 min-h-[340px]">
              <div className="mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  실시간 렌더링 미리보기 (본문 삽입 이미지 포함)
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  정상 렌더링 검증 완료
                </span>
              </div>
              <MarkdownRenderer content={formData.bodyMarkdown} />
            </div>
          )}
        </div>

        {/* 5. Gallery Images Attachment & Quick Insert */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                갤러리 스크린샷 첨부 ({images.length}/20)
              </label>
              <p className="text-[11px] text-slate-500">
                첨부된 이미지는 아래에서 [본문에 삽입]을 눌러 원하는 위치에 추가할 수도 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>파일 선택 (다중)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`첨부 ${idx + 1}`} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                    title="삭제"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertImageToMarkdown(img, `스크린샷 ${idx + 1}`)}
                    className="absolute bottom-1 inset-x-1 py-1 rounded-md bg-blue-600/90 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors text-center opacity-90 group-hover:opacity-100"
                  >
                    본문에 삽입 ↵
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Official Source Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              공식 출처 표기 (Source Name)
            </label>
            <input
              type="text"
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              공식 원문 URL (Source URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* 7. Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>업데이트 등록 중...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>업데이트 정식 등록 완료</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
