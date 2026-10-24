"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, KeyRound, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"NONE" | "EMAIL" | "SMS" | "OTP">("NONE");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code: code || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      // Check if 2FA challenge is requested
      if (data.require2FA) {
        setRequire2FA(true);
        setTwoFactorMethod(data.twoFactorType || "EMAIL");
        setSuccessMsg(data.message || "2단계 인증 코드를 입력해 주세요.");
        return;
      }

      window.dispatchEvent(new Event("auth-state-changed"));
      window.location.href = `/profile/${data.user.profileCode}`;
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend2FACode = async () => {
    if (!email) {
      setErrorMsg("이메일 주소를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "LOGIN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "인증번호 발송 실패");
      setSuccessMsg(data.message || "인증번호가 발송되었습니다.");
      if (data.method) {
        setTwoFactorMethod(data.method);
      }
      setRequire2FA(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="NextUps"
            className="w-12 h-12 rounded-xl object-contain shadow-xs border border-slate-200"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          NextUps 로그인
        </h1>
        <p className="text-xs text-slate-600">
          가입된 계정의 이메일과 비밀번호로 안전하게 로그인합니다.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              가입된 이메일 주소 *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                비밀번호 *
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {require2FA && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {twoFactorMethod === "SMS"
                  ? "📱 휴대전화 문자(SMS) 6자리 인증번호 *"
                  : twoFactorMethod === "OTP"
                  ? "🔑 Google Authenticator(OTP) 앱 6자리 보안코드 *"
                  : "✉️ 이메일 6자리 일회용 보안 코드 *"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-base font-mono tracking-widest text-center rounded-lg border border-blue-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-blue-500" />
              </div>
              <p className="text-[11px] text-slate-500">
                {twoFactorMethod === "SMS"
                  ? "가입 시 등록된 휴대전화로 전송된 6자리 번호를 입력해 주세요."
                  : twoFactorMethod === "OTP"
                  ? "스마트폰 OTP 앱(Google Authenticator)에 표시된 6자리를 입력해 주세요."
                  : "가입된 이메일 편지함으로 전송된 6자리 코드를 입력해 주세요."}
              </p>
            </div>
          )}

          {twoFactorMethod !== "OTP" && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSend2FACode}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {require2FA
                  ? twoFactorMethod === "SMS"
                    ? "문자(SMS) 인증번호 재발송"
                    : "이메일 인증번호 재발송"
                  : "2단계 보안코드 수동 요청 (선택)"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>로그인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          아직 계정이 없으신가요?{" "}
          <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
