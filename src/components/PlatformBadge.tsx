import React from "react";
import { Monitor, Smartphone, Apple, Laptop } from "lucide-react";

interface PlatformBadgeProps {
  platformKey: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function PlatformBadge({
  platformKey,
  name,
  size = "md",
  showIcon = true,
}: PlatformBadgeProps) {
  const key = platformKey.toLowerCase();

  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    windows: {
      label: "Windows",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      icon: <Monitor className="w-3.5 h-3.5" />,
    },
    android: {
      label: "Android",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: <Smartphone className="w-3.5 h-3.5" />,
    },
    ios: {
      label: "iOS",
      bg: "bg-slate-100 dark:bg-slate-800/60",
      text: "text-slate-800 dark:text-slate-200",
      border: "border-slate-300 dark:border-slate-700",
      icon: <Apple className="w-3.5 h-3.5" />,
    },
    macos: {
      label: "macOS",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[key] || {
    label: name || platformKey,
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-300 dark:border-zinc-700",
    icon: <Monitor className="w-3.5 h-3.5" />,
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{name || config.label}</span>
    </span>
  );
}
