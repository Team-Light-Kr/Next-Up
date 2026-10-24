"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  KeyRound,
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"NONE" | "EMAIL" | "SMS" | "OTP">("NONE");
  const [sendwich, setSendwich] = useState<SendwichInfo | null>(null);
  const [useEmailFallback, setUseEmailFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSendwich, setCheckingSendwich] = useState(false);
  const [copiedDest, setCopiedDest] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeLogin = async (submitCode?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          code: submitCode || code.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "로그인에 실패했습니다.");
      }

      // Check if 2FA challenge is requested
      if (data.require2FA) {
        setRequire2FA(true);
        setTwoFactorMethod(data.twoFactorType || "EMAIL");
        if (data.sendwich) {
          setSendwich(data.sendwich);
        }
        setSuccessMsg(data.message || "2단계 인증을 진행해 주세요.");
        return;
      }

      // Login success
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      window.dispatchEvent(new Event("auth-state-changed"));
      window.location.href = `/profile/${data.user.profileCode}`;
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin();
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
        setSuccessMsg("휴대전화 문자 인증이 성공적으로 확인되었습니다. 로그인 중입니다...");
        await executeLogin(sendwich.id);
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
    if (sendwich?.id && require2FA && twoFactorMethod === "SMS") {
      pollTimerRef.current = setInterval(() => {
        checkSendwichVerification(true);
      }, 3500);

      // Listen to popup postMessage if popup is opened
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
  }, [sendwich?.id, require2FA, twoFactorMethod]);

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
      setSuccessMsg(data.message || "인증 정보가 갱신되었습니다.");
      if (data.method) {
        setTwoFactorMethod(data.method);
      }
      if (data.sendwich) {
        setSendwich(data.sendwich);
      }
      setRequire2FA(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          NextUps 로그인
        </h1>
        <p className="text-xs text-slate-600">
          가입된 계정의 이메일과 비밀번호로 안전하게 로그인합니다.
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

          {/* 2FA Section */}
          {require2FA && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {twoFactorMethod === "SMS" && sendwich && !useEmailFallback ? (
                /* Sendwich MO SMS UI */
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>휴대전화 문자(SMS) 점유 인증</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                      자동 감지 중
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    본인 휴대전화에서 아래 <strong>수신 번호</strong>로 <strong>인증 문구</strong>를 문자로 전송하시면 인증이 자동 완료됩니다.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 block mb-1">받는 번호 (수신 번호)</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{sendwich.destination}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sendwich.destination, "dest")}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                          title="번호 복사"
                        >
                          {copiedDest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-600 block mb-1">전송할 문구 (내용)</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600 truncate">{sendwich.smsText}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sendwich.smsText, "text")}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
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
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>문자 앱으로 바로 전송</span>
                    </a>

                    {sendwich.verificationUrl && (
                      <button
                        type="button"
                        onClick={() => window.open(sendwich.verificationUrl, "sendwich_window", "width=460,height=760")}
                        className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>공식 인증창 열기</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      disabled={checkingSendwich}
                      onClick={() => checkSendwichVerification(false)}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {checkingSendwich ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      <span>문자 전송 완료 확인</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseEmailFallback(true)}
                      className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                    >
                      이메일 코드로 입력하기
                    </button>
                  </div>
                </div>
              ) : (
                /* 6-Digit Code Input for Email, OTP, or SMS Fallback */
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {twoFactorMethod === "OTP" ? (
                        <>
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          <span>Google Authenticator(OTP) 6자리 보안코드 *</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span>이메일 6자리 인증번호 *</span>
                        </>
                      )}
                    </label>

                    {sendwich && useEmailFallback && (
                      <button
                        type="button"
                        onClick={() => setUseEmailFallback(false)}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                      >
                        문자 전송으로 전환
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-base font-mono tracking-widest text-center rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                    <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {twoFactorMethod === "OTP"
                      ? "스마트폰 OTP 앱(Google Authenticator)에 표시된 6자리를 입력해 주세요."
                      : "가입 이메일 편지함으로 전송된 6자리 일회용 코드를 입력해 주세요."}
                  </p>
                </div>
              )}
            </div>
          )}

          {twoFactorMethod !== "OTP" && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSend2FACode}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {require2FA ? "인증번호 재발송 요청" : "2단계 보안코드 수동 요청"}
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
