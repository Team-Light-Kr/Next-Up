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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/auth/login");
          return;
        }
        setUser(data.user);
        setFormData((prev) => ({
          ...prev,
          displayName: data.user.displayName || "",
          bio: data.user.bio || "",
          avatarUrl: data.user.avatarUrl || "",
          twoFactorType: data.user.twoFactorType || "NONE",
          phoneNumber: data.user.phoneNumber || "",
        }));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setStatusMsg({ type: "error", text: "새 비밀번호는 최소 6자 이상이어야 합니다." });
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setStatusMsg({ type: "error", text: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다." });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio,
          avatarUrl: formData.avatarUrl,
          twoFactorType: formData.twoFactorType,
          phoneNumber: formData.phoneNumber,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "설정 저장에 실패했습니다.");
      }

      setUser(data.user);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setStatusMsg({ type: "success", text: "설정이 성공적으로 저장되었습니다." });
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

      {user && !user.hasPassword && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">계정 보안 알림: 비밀번호 미설정 계정</div>
            <p className="text-amber-700 leading-relaxed">
              이전에 비밀번호 없이 생성된 계정입니다. 안전한 로그인 및 계정 보호를 위해 아래 <strong>비밀번호 설정</strong> 항목에서 비밀번호를 생성해 주세요.
            </p>
          </div>
        </div>
      )}

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

        {/* Password Setup and Change Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>{user?.hasPassword ? "비밀번호 변경" : "비밀번호 최초 설정 (필수)"}</span>
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              {user?.hasPassword ? "기존 비밀번호가 설정되어 있습니다" : "비밀번호가 미설정 상태입니다"}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {user?.hasPassword
              ? "비밀번호를 변경하려면 현재 비밀번호와 새로운 비밀번호를 입력해 주세요."
              : "보안 계정 이용을 위해 사용할 비밀번호(최소 6자)를 등록해 주세요."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user?.hasPassword && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {user?.hasPassword ? "새 비밀번호 (변경 시에만 입력)" : "새로 등록할 비밀번호 *"}
              </label>
              <input
                type="password"
                minLength={6}
                placeholder="최소 6자 이상"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                minLength={6}
                placeholder="비밀번호 재입력"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="pt-2 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                문자 수신 휴대전화 번호 *
              </label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-emerald-700">
                ※ 로그인 시 Sendwich SMS를 통해 이 번호로 6자리 인증번호가 발송됩니다.
              </p>
            </div>
          )}

          {formData.twoFactorType === "OTP" && user?.totpSecret && (
            <div className="pt-2 p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2">
              <div className="text-xs font-bold text-purple-900">
                Google Authenticator (OTP) 등록 안내
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                스마트폰의 Google Authenticator 또는 OTP 앱에서 [계정 추가] → [설정 키 입력]을 선택하고 아래 키를 등록해 주세요.
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-purple-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">내 계정 보안 키 (Base32)</div>
                  <div className="font-mono text-sm font-bold text-purple-700 tracking-wider select-all">
                    {user.totpSecret}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(user.totpSecret);
                    alert("OTP 보안 키가 클립보드에 복사되었습니다!");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors"
                >
                  키 복사
                </button>
              </div>
              <p className="text-[10px] text-purple-700">
                ※ 계정 이름: NextUps ({user.email}) / 키 유형: 시간 기준(TOTP)
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
