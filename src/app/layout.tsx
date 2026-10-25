import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "NextUps",
  description:
    "Windows, PlayStation, Nintendo Switch, Android, iOS, macOS 멀티플랫폼 게임의 최신 패치 노트, 공식 업데이트 이력 및 버전 정보를 빠르고 정확하게 제공합니다.",
  keywords: [
    "게임 업데이트",
    "패치 노트",
    "멀티플랫폼 게임",
    "Windows 게임",
    "PlayStation 게임",
    "Nintendo Switch 게임",
    "콘솔 게임 패치",
    "Android 게임",
    "iOS 게임",
    "macOS 게임",
    "NextUps",
  ],
  authors: [{ name: "Team Light" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  metadataBase: new URL("https://www.nextups.xyz"),
  openGraph: {
    title: "NextUps",
    description: "Windows, PlayStation, Nintendo Switch, Android, iOS, macOS 공식 개발사 및 스토어 출처 기반 멀티플랫폼 게임 업데이트 허브",
    url: "https://www.nextups.xyz",
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
    <html lang="ko" className="h-full antialiased light" style={{ colorScheme: "light" }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
