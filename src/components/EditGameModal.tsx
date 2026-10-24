"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Trash2, X, Check, Loader2, AlertCircle, Save } from "lucide-react";
import ImageUploadInput from "./ImageUploadInput";

interface EditGameModalProps {
  game: {
    id: string;
    slug: string;
    canonicalName: string;
    description: string;
    developer: string | null;
    publisher: string | null;
    officialWebsiteUrl: string | null;
    iconUrl: string | null;
    coverImageUrl: string | null;
    genres: string[];
    status: string;
  };
  canManage: boolean;
}

export default function EditGameModal({ game, canManage }: EditGameModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    canonicalName: game.canonicalName,
    developer: game.developer || "",
    publisher: game.publisher || "",
    officialWebsiteUrl: game.officialWebsiteUrl || "",
    iconUrl: game.iconUrl || "",
    coverImageUrl: game.coverImageUrl || "",
    description: game.description,
    genresText: game.genres.join(", "),
  });

  if (!canManage) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const genres = formData.genresText
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/games/${game.slug}/manage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonicalName: formData.canonicalName,
          developer: formData.developer,
          publisher: formData.publisher,
          officialWebsiteUrl: formData.officialWebsiteUrl,
          iconUrl: formData.iconUrl,
          coverImageUrl: formData.coverImageUrl,
          description: formData.description,
          genres,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "수정에 실패했습니다.");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`정말로 '${game.canonicalName}' 게임을 영구 삭제하시겠습니까?\n모든 플랫폼 정보와 패치노트도 함께 삭제됩니다.`)) {
      return;
    }

    setDeleteLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/games/${game.slug}/manage`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      alert("게임이 성공적으로 삭제되었습니다.");
      router.push("/games");
    } catch (err: any) {
      setErrorMsg(err.message || "삭제 실패");
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
        title="게임 데이터 수정 및 삭제"
      >
        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
        <span>게임 관리</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span>게임 정보 수정 및 관리</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  식별자: <span className="font-mono text-slate-700 font-semibold">{game.slug}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  게임 공식 명칭 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.canonicalName}
                  onChange={(e) => setFormData({ ...formData, canonicalName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    개발사 (Developer)
                  </label>
                  <input
                    type="text"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    퍼블리셔 (Publisher)
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  공식 홈페이지 URL
                </label>
                <input
                  type="url"
                  value={formData.officialWebsiteUrl}
                  onChange={(e) => setFormData({ ...formData, officialWebsiteUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  장르 태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.genresText}
                  onChange={(e) => setFormData({ ...formData, genresText: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadInput
                  label="게임 대표 아이콘"
                  value={formData.iconUrl}
                  onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                  aspect="square"
                />
                <ImageUploadInput
                  label="커버 배너 이미지"
                  value={formData.coverImageUrl}
                  onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
                  aspect="cover"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  게임 상세 소개 *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>게임 영구 삭제</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>변경사항 저장</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
