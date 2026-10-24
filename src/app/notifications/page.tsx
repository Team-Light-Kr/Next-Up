"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, Gamepad2, ChevronRight, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleReadAll = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>내 알림함</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            관심 등록한 게임의 새로운 패치 노트 및 서비스 알림입니다.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleReadAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>모두 읽음 처리</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">알림을 불러오는 중입니다...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => {
            const dateStr = new Date(n.createdAt).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !n.read
                    ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.read
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>
                </div>

                {n.updateId && (
                  <Link
                    href={`/updates/${n.updateId}`}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                  >
                    <span>패치 보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            새로운 알림이 없습니다
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            관심 게임을 등록해 두시면 새로운 업데이트 배포 시 즉시 알려드립니다.
          </p>
        </div>
      )}
    </div>
  );
}
