import React from "react";
import { Monitor, Smartphone, Apple, Laptop, Gamepad2 } from "lucide-react";

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
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <Monitor className="w-3.5 h-3.5" />,
    },
    nintendo: {
      label: "Nintendo Switch",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    switch: {
      label: "Nintendo Switch",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    playstation: {
      label: "PlayStation",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    ps5: {
      label: "PS5",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    ps4: {
      label: "PS4",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
    android: {
      label: "Android",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <Smartphone className="w-3.5 h-3.5" />,
    },
    ios: {
      label: "iOS",
      bg: "bg-slate-100",
      text: "text-slate-800",
      border: "border-slate-300",
      icon: <Apple className="w-3.5 h-3.5" />,
    },
    macos: {
      label: "macOS",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[key] || {
    label: name || platformKey,
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    border: "border-zinc-300",
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
