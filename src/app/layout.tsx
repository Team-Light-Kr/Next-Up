import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "NextUps | 멀티플랫폼 게임 업데이트 정보 통합 플랫폼",
  description:
    "Windows, Android, iOS, macOS 멀티플랫폼 게임의 최신 패치 노트, 공식 업데이트 이력 및 버전 정보를 빠르고 정확하게 제공합니다.",
  keywords: [
    "게임 업데이트",
    "패치 노트",
    "멀티플랫폼 게임",
    "Windows 게임",
    "Android 게임",
    "iOS 게임",
    "macOS 게임",
    "NextUps",
  ],
  authors: [{ name: "Team Light" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "NextUps | 게임 업데이트 정보 통합 플랫폼",
    description: "공식 개발사 및 스토어 출처 기반 멀티플랫폼 게임 업데이트 허브",
    url: "https://nextups.xyz",
    siteName: "NextUps",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
