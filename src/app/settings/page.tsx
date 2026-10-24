"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Shield,
  Smartphone,
  Mail,
  KeyRound,
  User,
  Image,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import ImageUploadInput from "@/components/ImageUploadInput";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    twoFactorType: "NONE",
    phoneNumber: "",
  });

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/auth/login");
          return;
        }
        setUser(data.user);
        setFormData({
          displayName: data.user.displayName || "",
          bio: data.user.bio || "",
          avatarUrl: data.user.avatarUrl || "",
          twoFactorType: data.user.twoFactorType || "NONE",
          phoneNumber: data.user.phoneNumber || "",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "설정 저장에 실패했습니다.");
      }

      setStatusMsg({ type: "success", text: "프로필 및 2단계 인증 설정이 안전하게 저장되었습니다." });
      setUser(data.user);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">사용자 설정을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${user?.profileCode}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>내 프로필로 돌아가기</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>계정 및 보안 설정</span>
        </h1>
        <p className="text-xs text-slate-500">
          프로필을 자유롭게 꾸미고 계정 보호를 위한 2단계 인증 수단을 지정합니다.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Customization Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>프로필 꾸미기</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <ImageUploadInput
              label="프로필 아바타 이미지"
              value={formData.avatarUrl}
              onChange={(val) => setFormData({ ...formData, avatarUrl: val })}
              aspect="avatar"
              helpText="원형으로 표시됩니다 (JPG, PNG, WEBP)"
              maxDimension={256}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                소개글 (Bio)
              </label>
              <textarea
                rows={3}
                placeholder="자신을 나타내는 소개글을 작성해 보세요."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 2-Factor Authentication (2FA) Section (3 options: Email, SMS Sendwich, OTP) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>2단계 인증 (2FA) 설정</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              로그인이나 위험 작업 수행 시 본인 확인을 위한 추가 인증 수단을 선택합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Email */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                formData.twoFactorType === "EMAIL"
                  ? "border-blue-500 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <input
                  type="radio"
                  name="twoFactorType"
                  value="EMAIL"
                  checked={formData.twoFactorType === "EMAIL"}
                  onChange={(e) => setFormData({ ...formData, twoFactorType: e.target.value })}
                  className="sr-only"
                />
                <Mail className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-bold text-xs">1. 이메일 인증</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Resend 기반 6자리 일회용 코드 수신
                </p>
              </div>
            </label>

            {/* Option 2: SMS */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                formData.twoFactorType === "SMS"
                  ? "border-blue-500 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <input
                  type="radio"
                  name="twoFactorType"
                  value="SMS"
                  checked={formData.twoFactorType === "SMS"}
                  onChange={(e) => setFormData({ ...formData, twoFactorType: e.target.value })}
                  className="sr-only"
                />
                <Smartphone className="w-5 h-5 text-emerald-600 mb-2" />
                <div className="font-bold text-xs">2. 문자(SMS) 인증</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  샌드위치(Sendwich) 휴대전화 문자 발송
                </p>
              </div>
            </label>

            {/* Option 3: OTP */}
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                formData.twoFactorType === "OTP"
                  ? "border-blue-500 bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <input
                  type="radio"
                  name="twoFactorType"
                  value="OTP"
                  checked={formData.twoFactorType === "OTP"}
                  onChange={(e) => setFormData({ ...formData, twoFactorType: e.target.value })}
                  className="sr-only"
                />
                <KeyRound className="w-5 h-5 text-purple-600 mb-2" />
                <div className="font-bold text-xs">3. OTP 앱 인증</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Google Authenticator 등의 인증 앱
                </p>
              </div>
            </label>
          </div>

          {formData.twoFactorType === "SMS" && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                문자 수신 휴대전화 번호
              </label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                ※ Sendwich 서비스 연동 번호로 인증 문자가 발송됩니다.
              </p>
            </div>
          )}

          {formData.twoFactorType !== "NONE" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, twoFactorType: "NONE" })}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                2단계 인증 해제
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href={`/profile/${user?.profileCode}`}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>설정 저장하기</span>
          </button>
        </div>
      </form>
    </div>
  );
}
