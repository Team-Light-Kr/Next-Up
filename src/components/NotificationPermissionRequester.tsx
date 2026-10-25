"use client";

import React, { useEffect, useState } from "react";
import { Bell, Mail, X, Check, ShieldCheck } from "lucide-react";

export default function NotificationPermissionRequester() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"PROMPT" | "RESULT">("PROMPT");

  useEffect(() => {
    // SSR 방어
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // 이미 사용자가 결정을 내린 적이 있는지 로컬스토리지 확인
    const dismissedAt = localStorage.getItem("nextups_notify_prompt_closed");
    const now = Date.now();

    // 일주일 이내에 이미 결정을 내렸거나 닫았다면 재질문 방지
    if (dismissedAt && now - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 브라우저 알림 권한이 "default" (아직 묻지 않은 상태)일 때만 요청 배너 노출
    if (Notification.permission === "default") {
      // 사이트 접속 후 1초 뒤 부드럽게 노출
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (Notification.permission === "denied") {
      // 이미 거부되어 있는 경우 이메일 알림 보장 플래그 설정
      localStorage.setItem("nextups_notify_fallback_email", "true");
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!("Notification" in window)) {
      setMode("RESULT");
      setStatusMessage("브라우저가 웹 푸시를 지원하지 않아 관심 게임 패치노트를 이메일로만 발송합니다.");
      localStorage.setItem("nextups_notify_fallback_email", "true");
      closeAfterDelay();
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem("nextups_notify_prompt_closed", Date.now().toString());

      if (permission === "granted") {
        setMode("RESULT");
        setStatusMessage("브라우저 실시간 알림이 활성화되었습니다! 관심 게임의 새 패치노트를 가장 먼저 안내해 드립니다.");
        localStorage.setItem("nextups_notify_fallback_email", "false");

        // 브라우저 환영 알림 (정상 활성화 테스트)
        try {
          new Notification("NextUps 패치 알림 활성화", {
            body: "관심 등록한 게임의 공식 패치노트와 업데이트가 출시되면 즉시 알려드립니다.",
            icon: "/favicon.png",
          });
        } catch {
          // 모바일이나 일부 브라우저 예외 방어
        }
      } else {
        setMode("RESULT");
        setStatusMessage("브라우저 알림이 비활성화되었습니다. 관심 게임 패치노트는 가입하신 이메일 계정으로 안전하게 발송됩니다.");
        localStorage.setItem("nextups_notify_fallback_email", "true");
      }
    } catch {
      setMode("RESULT");
      setStatusMessage("알림 권한을 확인할 수 없습니다. 관심 게임 패치 소식은 이메일로 발송됩니다.");
      localStorage.setItem("nextups_notify_fallback_email", "true");
    }

    closeAfterDelay();
  };

  const handleEmailOnly = () => {
    localStorage.setItem("nextups_notify_prompt_closed", Date.now().toString());
    localStorage.setItem("nextups_notify_fallback_email", "true");
    setMode("RESULT");
    setStatusMessage("관심 게임 패치 소식을 등록된 이메일 계정으로만 수신하도록 설정되었습니다.");
    closeAfterDelay();
  };

  const closeAfterDelay = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 2800);
  };

  const handleClose = () => {
    localStorage.setItem("nextups_notify_prompt_closed", Date.now().toString());
    localStorage.setItem("nextups_notify_fallback_email", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full mx-auto p-1 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-5 text-slate-800 space-y-4">
        {mode === "PROMPT" ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    관심 게임 패치노트 알림
                  </h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    실시간
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  관심 등록한 게임의 새 업데이트와 패치노트가 출시될 때 브라우저 알림으로 가장 빠르게 안내해 드립니다.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>알림 비활성화 시 등록된 이메일 계정으로만 전송됩니다.</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleRequestPermission}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>알림 켜기 (권장)</span>
              </button>
              <button
                onClick={handleEmailOnly}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                이메일로만 받기
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-800 leading-snug">
              {statusMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
