import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CurrentDate } from "@/components/CurrentDate";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NextUps" className="w-6 h-6 rounded-md" />
              <span className="font-bold text-base text-neutral-900">
                NextUps
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Windows, PlayStation, Nintendo Switch, Android, iOS, macOS 멀티플랫폼 게임 업데이트 및 패치 정보를 통합 제공하는 비영리 공공 플랫폼입니다.
            </p>
            <div className="text-xs text-neutral-500">
              Team Light 운영
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              플랫폼
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/platforms/windows" className="hover:text-neutral-900">
                  Windows PC
                </Link>
              </li>
              <li>
                <Link href="/platforms/playstation" className="hover:text-neutral-900">
                  PlayStation
                </Link>
              </li>
              <li>
                <Link href="/platforms/nintendo" className="hover:text-neutral-900">
                  Nintendo Switch
                </Link>
              </li>
              <li>
                <Link href="/platforms/android" className="hover:text-neutral-900">
                  Android
                </Link>
              </li>
              <li>
                <Link href="/platforms/ios" className="hover:text-neutral-900">
                  iOS
                </Link>
              </li>
              <li>
                <Link href="/platforms/macos" className="hover:text-neutral-900">
                  macOS
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              서비스
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/games" className="hover:text-neutral-900">
                  게임 목록
                </Link>
              </li>
              <li>
                <Link href="/games/new" className="hover:text-neutral-900">
                  신규 게임 등록
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-neutral-900">
                  버전 비교 도구
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
              운영 및 약관
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/legal/privacy" className="hover:text-neutral-900">
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link href="/legal/youth" className="hover:text-neutral-900">
                  청소년 보호정책
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-neutral-900">
                  서비스 이용약관
                </Link>
              </li>
              <li className="pt-1 text-[11px] text-neutral-400">
                ※ 모든 정책 개정 시 최소 7일 전 사전 공지됩니다.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© <CurrentDate format="year" /> Team Light. All rights reserved. (nextups.xyz)</p>
          <p>비영리 무료 공공 서비스</p>
        </div>
      </div>
    </footer>
  );
}
