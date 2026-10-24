"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "VERIFY">("EMAIL");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "REGISTER" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "인증번호 발송에 실패했습니다.");
      }

      setSuccessMsg(data.message);
      setStep("VERIFY");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, displayName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      router.push(`/profile/${data.user.profileCode}`);
      router.refresh();
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
            className="w-12 h-12 rounded-xl object-contain shadow-xs"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          NextUps 회원가입
        </h1>
        <p className="text-xs text-neutral-500">
          안전한 6자리 이메일 인증으로 비밀번호 없이 간편하게 가입하세요.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                닉네임
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="사용하실 닉네임"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                이메일 주소
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !displayName}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>인증번호 받기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  이메일로 전송된 6자리 인증번호
                </label>
                <button
                  type="button"
                  onClick={() => setStep("EMAIL")}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  이메일 변경
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-lg font-mono tracking-widest text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                ※ 스팸 메일함으로 수신될 수 있으니 확인해 주세요.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>가입 완료하고 프로필 생성</span>
            </button>
          </form>
        )}

        <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
