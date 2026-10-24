"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Plus,
  Monitor,
  Smartphone,
  Apple,
  Laptop,
  Bell,
  User,
  LogOut,
  Settings,
  Shield,
  Activity,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
          setUnreadCount(data.unreadNotificationCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="NextUps"
                className="w-8 h-8 rounded-lg shadow-xs"
              />
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-neutral-900">
                  NextUps
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600">
              <Link
                href="/"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/")}
                className="px-3 py-1.5 rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                홈
              </Link>
              <Link
                href="/games"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/games")}
                className="px-3 py-1.5 rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                게임
              </Link>

              <div className="h-3.5 w-px bg-neutral-200 mx-1.5" />

              <Link
                href="/platforms/windows"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/platforms/windows")}
                className="px-2.5 py-1 text-xs rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                Windows
              </Link>
              <Link
                href="/platforms/android"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/platforms/android")}
                className="px-2.5 py-1 text-xs rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                Android
              </Link>
              <Link
                href="/platforms/ios"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/platforms/ios")}
                className="px-2.5 py-1 text-xs rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Apple className="w-3.5 h-3.5 text-neutral-800" />
                iOS
              </Link>
              <Link
                href="/platforms/macos"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/platforms/macos")}
                className="px-2.5 py-1 text-xs rounded-md hover:text-neutral-900 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Laptop className="w-3.5 h-3.5 text-purple-600" />
                macOS
              </Link>
            </nav>
          </div>

          {/* Search Bar & User Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="게임 또는 패치 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-56 pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            </form>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Member Game Registration Button */}
                <Link
                  href="/games/new"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>게임 등록</span>
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 transition-colors"
                  title="알림함"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </Link>

                {/* Profile Link */}
                <Link
                  href={`/profile/${currentUser.profileCode}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{currentUser.displayName}</span>
                </Link>

                {/* Admin Only Dashboard Button */}
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-neutral-900 text-white hover:opacity-90"
                    title="관리자 전용 대시보드"
                  >
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>어드민</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white hover:opacity-90 transition-opacity"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 focus:outline-none"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="게임 또는 패치 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 bg-neutral-50 text-neutral-900"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-neutral-400" />
          </form>

          <nav className="flex flex-col space-y-1 text-sm">
            <Link
              href="/"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-neutral-100"
            >
              홈
            </Link>
            <Link
              href="/games"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-neutral-100"
            >
              게임 목록
            </Link>

            <div className="grid grid-cols-2 gap-1 py-1 px-1">
              <Link
                href="/platforms/windows"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-50 hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <Monitor className="w-3.5 h-3.5 text-blue-600" /> Windows
              </Link>
              <Link
                href="/platforms/android"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-50 hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Android
              </Link>
              <Link
                href="/platforms/ios"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-50 hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <Apple className="w-3.5 h-3.5 text-neutral-800" /> iOS
              </Link>
              <Link
                href="/platforms/macos"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 text-xs rounded-md bg-neutral-50 hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <Laptop className="w-3.5 h-3.5 text-purple-600" /> macOS
              </Link>
            </div>

            {currentUser ? (
              <>
                <Link
                  href="/games/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-blue-600 font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> 신규 게임 등록
                </Link>
                <Link
                  href={`/profile/${currentUser.profileCode}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" /> 프로필 ({currentUser.displayName})
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 flex items-center gap-1.5"
                >
                  <Bell className="w-4 h-4" /> 알림함 ({unreadCount})
                </Link>
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-emerald-600 font-semibold flex items-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" /> 관리자 대시보드
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              </>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-medium rounded-md border border-neutral-200"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold rounded-md bg-neutral-900 text-white"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
