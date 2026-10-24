"use client";

import React, { useEffect, useState } from "react";

interface CurrentDateProps {
  format?: "full" | "short" | "year" | "time" | "iso";
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CurrentDate({
  format = "short",
  className = "",
  prefix = "",
  suffix = "",
}: CurrentDateProps) {
  const [dateText, setDateText] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (format === "year") {
        setDateText(`${now.getFullYear()}`);
      } else if (format === "full") {
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const day = days[now.getDay()];
        setDateText(
          `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${day})`
        );
      } else if (format === "time") {
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        setDateText(`${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${hours}:${minutes}`);
      } else if (format === "iso") {
        setDateText(now.toISOString().split("T")[0]);
      } else {
        // default 'short': e.g. "2026년 10월 24일"
        setDateText(`${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`);
      }
    };

    update();
    // Update every minute if time is needed
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [format]);

  // Safe fallback while client hydrates
  if (!dateText) {
    const fallback =
      format === "year"
        ? "2026"
        : format === "full"
        ? "2026년 10월 24일 (토)"
        : "2026년 10월 24일";
    return (
      <span className={className} suppressHydrationWarning>
        {prefix}
        {fallback}
        {suffix}
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}
      {dateText}
      {suffix}
    </span>
  );
}

export default CurrentDate;
