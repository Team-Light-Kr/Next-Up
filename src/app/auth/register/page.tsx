"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface SendwichInfo {
  id: string;
  destination: string;
  smsText: string;
  verificationUrl?: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<"INFO" | "VERIFY_EMAIL" | "VERIFY_SMS">("INFO");
  const [authMethod, setAuthMethod] = useState<"EMAIL" | "SMS">("EMAIL");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [sendwich, setSendwich] = useState<SendwichInfo | null>(null);
  const [copiedDest, setCopiedDest] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [checkingSendwich, setCheckingSendwich] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: "REGISTER",
          channel: authMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "인증 요청에 실패했습니다.");
      }

      setSuccessMsg(data.message);

      if (authMethod === "SMS" && data.sendwich) {
        setSendwich(data.sendwich);
        setStep("VERIFY_SMS");
      } else {
        setStep("VERIFY_EMAIL");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeRegister = async (verifiedCode: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verifiedCode,
          displayName: displayName.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.dispatchEvent(new Event("auth-state-changed"));
      window.location.href = `/profile/${data.user.profileCode}`;
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeRegister(code.trim());
  };

  const checkSendwichVerification = async (silent = false) => {
    if (!sendwich?.id) return;
    if (!silent) setCheckingSendwich(true);

    try {
      const res = await fetch(
        `/api/auth/sendwich-check?id=${encodeURIComponent(sendwich.id)}&email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      const data = await res.json();

      if (data.verified) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setSuccessMsg("문자 인증이 확인되었습니다! 계정을 생성하는 중입니다...");
        await executeRegister(sendwich.id);
      } else if (!silent) {
        setErrorMsg("아직 문자 수신이 확인되지 않았습니다. 문자를 전송하신 후 3~5초 뒤 다시 확인해 주세요.");
      }
    } catch {
      if (!silent) setErrorMsg("인증 상태 확인 중 통신 오류가 발생했습니다.");
    } finally {
      if (!silent) setCheckingSendwich(false);
    }
  };

  // Poll Sendwich verification status every 3.5 seconds when active
  useEffect(() => {
    if (sendwich?.id && step === "VERIFY_SMS") {
      pollTimerRef.current = setInterval(() => {
        checkSendwichVerification(true);
      }, 3500);

      const handleMessage = (event: MessageEvent) => {
        if (event.origin === "https://id.it.kr") {
          const data = event.data;
          if (data?.type === "veri.verification.result" && data.id === sendwich.id && data.status === "verified") {
            checkSendwichVerification(false);
          }
        }
      };
      window.addEventListener("message", handleMessage);

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [sendwich?.id, step]);

  const copyToClipboard = (text: string, type: "dest" | "text") => {
    navigator.clipboard.writeText(text);
    if (type === "dest") {
      setCopiedDest(true);
      setTimeout(() => setCopiedDest(false), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
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
            className="w-12 h-12 rounded-xl object-contain border border-slate-200"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          NextUps 회원가입
        </h1>
        <p className="text-xs text-slate-600">
          안전한 계정 보안과 점유 인증으로 간편하게 가입하세요.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
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

        {step === "INFO" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                닉네임 *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="사용하실 닉네임"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                이메일 주소 *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                비밀번호 (최소 6자) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Authentication Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                본인 확인 인증 수단 선택 *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod("EMAIL")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    authMethod === "EMAIL"
                      ? "border-blue-600 bg-blue-50/60 text-blue-700 font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>이메일 인증</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod("SMS")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    authMethod === "SMS"
                      ? "border-blue-600 bg-blue-50/60 text-blue-700 font-semibold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>휴대폰 문자(SMS)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !displayName || !password || !confirmPassword}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{authMethod === "SMS" ? "휴대폰 문자 인증 시작" : "이메일 인증번호 받기"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : step === "VERIFY_SMS" && sendwich ? (
          /* Sendwich MO Verification Step */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>샌드위치 휴대폰 문자 인증</span>
              </span>
              <button
                type="button"
                onClick={() => setStep("INFO")}
                className="text-[11px] text-slate-500 hover:underline cursor-pointer"
              >
                정보 수정
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              본인 휴대전화에서 아래 <strong>수신 번호</strong>로 <strong>인증 문구</strong>를 문자로 전송하시면 인증이 자동 확인됩니다.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-600 block mb-1">받는 번호 (수신 번호)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{sendwich.destination}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sendwich.destination, "dest")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="번호 복사"
                  >
                    {copiedDest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-600 block mb-1">전송할 문구 (내용)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600 truncate">{sendwich.smsText}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sendwich.smsText, "text")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="문구 복사"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`sms:${sendwich.destination}?body=${encodeURIComponent(sendwich.smsText)}`}
                className="flex-1 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>문자 앱으로 바로 전송</span>
              </a>

              {sendwich.verificationUrl && (
                <button
                  type="button"
                  onClick={() => window.open(sendwich.verificationUrl, "sendwich_window", "width=460,height=760")}
                  className="py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>공식 인증창 열기</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">문자를 전송하셨나요?</span>
              <button
                type="button"
                disabled={checkingSendwich || loading}
                onClick={() => checkSendwichVerification(false)}
                className="py-1.5 px-3 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {checkingSendwich || loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>전송 완료 확인</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep("VERIFY_EMAIL")}
                className="text-[11px] text-slate-500 hover:underline cursor-pointer"
              >
                이메일 6자리 코드로 인증하기
              </button>
            </div>
          </div>
        ) : (
          /* Email 6-Digit Verification Step */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  이메일로 전송된 6자리 인증번호
                </label>
                <button
                  type="button"
                  onClick={() => setStep("INFO")}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  정보 수정
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
                  className="w-full pl-9 pr-3 py-2 text-lg font-mono tracking-widest text-center rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ※ 스팸 메일함으로 수신될 수 있으니 확인해 주세요.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>가입 완료하고 프로필 생성</span>
            </button>
          </form>
        )}

        <div className="pt-4 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
