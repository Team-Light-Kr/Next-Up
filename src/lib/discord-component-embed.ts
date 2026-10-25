import {
  Container,
  Section,
  TextDisplay,
  Thumbnail,
  Separator,
  ActionRow,
  LinkButton,
  h,
  toComponentEmbedJson,
  toComponentEmbedScript,
  componentEmbedResponse,
} from "discord-component-embed";

const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextups.xyz";

export function toFullUrl(pathOrUrl?: string | null, appUrl = DEFAULT_APP_URL): string {
  if (!pathOrUrl) return `${appUrl}/logo.png`;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${appUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * 1. Root / Home Page Component Embed (/)
 */
export function buildHomeEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Logo",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps](${appUrl})\n**멀티플랫폼 게임 업데이트 정보 통합 플랫폼**\nWindows, PlayStation, Nintendo Switch, Android, iOS, macOS 공식 최신 패치노트와 버전 정보를 실시간으로 확인하세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "최신 게임 패치",
      }),
      h(LinkButton, {
        url: `${appUrl}/platforms/playstation`,
        label: "PlayStation 허브",
      }),
      h(LinkButton, {
        url: `${appUrl}/platforms/nintendo`,
        label: "Nintendo Switch 허브",
      }),
      h(LinkButton, {
        url: `${appUrl}/download`,
        label: "공식 앱 다운로드",
      })
    )
  );
}

/**
 * 2. Games List Page Component Embed (/games)
 */
export function buildGamesListEmbed(count?: number, appUrl = DEFAULT_APP_URL) {
  const countText = count !== undefined ? ` (현재 ${count}개 등록)` : "";
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Games Directory",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 게임 디렉터리](${appUrl}/games)${countText}\n**멀티플랫폼 게임 패치 및 버전 검색**\nPC Windows, 콘솔(PlayStation, Nintendo Switch), 모바일 Android, iOS, macOS의 최신 패치노트와 업데이트 내역을 탐색해보세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "전체 게임 탐색",
      }),
      h(LinkButton, {
        url: `${appUrl}/platforms/playstation`,
        label: "PlayStation 패치",
      }),
      h(LinkButton, {
        url: `${appUrl}/platforms/nintendo`,
        label: "Nintendo 패치",
      }),
      h(LinkButton, {
        url: `${appUrl}/compare`,
        label: "버전 비교 도구",
      })
    )
  );
}

/**
 * 3. Game Detail Page Component Embed (/games/[slug])
 */
export function buildGameEmbed(
  game: {
    canonicalName: string;
    slug: string;
    description?: string | null;
    iconUrl?: string | null;
  },
  latestVersion?: string,
  appUrl = DEFAULT_APP_URL
) {
  const versionText = latestVersion ? ` (최신 v${latestVersion})` : "";
  const desc = (game.description || `${game.canonicalName}의 공식 실시간 패치 정보 및 버전 내역입니다.`)
    .slice(0, 180);

  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: toFullUrl(game.iconUrl, appUrl),
          description: game.canonicalName,
        }),
      },
      h(
        TextDisplay,
        null,
        `# [${game.canonicalName}](${appUrl}/games/${game.slug})${versionText}\n${desc}`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/games/${game.slug}`,
        label: "전체 패치 내역 보기",
      }),
      h(LinkButton, {
        url: appUrl,
        label: "NextUps 공식 홈",
      })
    )
  );
}

/**
 * 4. Update / Patch Note Page Component Embed (/updates/[id])
 */
export function buildUpdateEmbed(
  update: {
    id: string;
    title: string;
    version: string;
    summary?: string | null;
    game: {
      canonicalName: string;
      slug: string;
      iconUrl?: string | null;
    };
  },
  appUrl = DEFAULT_APP_URL
) {
  const summaryText = (update.summary || `${update.game.canonicalName}의 최신 패치노트 세부 내용입니다.`).slice(0, 180);

  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: toFullUrl(update.game.iconUrl, appUrl),
          description: update.game.canonicalName,
        }),
      },
      h(
        TextDisplay,
        null,
        `# [${update.game.canonicalName}](${appUrl}/games/${update.game.slug}) • v${update.version}\n**[${update.title}](${appUrl}/updates/${update.id})**\n${summaryText}`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/updates/${update.id}`,
        label: "패치노트 전문 보기",
      }),
      h(LinkButton, {
        url: `${appUrl}/games/${update.game.slug}`,
        label: `${update.game.canonicalName} 게임 정보`,
      })
    )
  );
}

/**
 * 5. Platform Hub Page Component Embed (/platforms/[platform])
 */
export function buildPlatformEmbed(
  platform: {
    key: string;
    name: string;
    description?: string;
  },
  count?: number,
  appUrl = DEFAULT_APP_URL
) {
  const countDesc = count !== undefined ? ` • ${count}개 타이틀 등록` : "";
  const desc = (platform.description || `${platform.name} 환경의 실시간 게임 업데이트 및 패치 정보를 확인하세요.`).slice(0, 180);

  const platformColors: Record<string, number> = {
    playstation: 0x003791,
    ps5: 0x003791,
    ps4: 0x003791,
    nintendo: 0xe60012,
    switch: 0xe60012,
    windows: 0x0078d4,
    android: 0x10b981,
    ios: 0x0f172a,
    macos: 0x8b5cf6,
  };
  const accentColor = platformColors[platform.key.toLowerCase()] || 0x2563eb;

  return h(
    Container,
    { accentColor },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: `${platform.name} Platform`,
        }),
      },
      h(
        TextDisplay,
        null,
        `# [${platform.name} 게임 패치 허브](${appUrl}/platforms/${platform.key})${countDesc}\n${desc}`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/platforms/${platform.key}`,
        label: `${platform.name} 패치 보기`,
      }),
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "전체 게임 탐색",
      })
    )
  );
}

/**
 * 6. Compare Page Component Embed (/compare)
 */
export function buildCompareEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Compare",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 플랫폼 버전 비교](${appUrl}/compare)\n**플랫폼별 버전 격차 및 동기화 현황 분석**\nWindows, PlayStation, Nintendo Switch, Android, iOS, macOS 간의 버전 불일치와 크로스플랫폼 패치 현황을 한눈에 비교하세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/compare`,
        label: "버전 비교표 열기",
      }),
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "게임 목록 보기",
      })
    )
  );
}

/**
 * 7. Download Page Component Embed (/download)
 */
export function buildDownloadEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Download",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 앱 다운로드](${appUrl}/download)\n**공식 Windows 데스크톱 클라이언트 & Android 앱**\nv1.0.1 최신 버전 다운로드: 독립 실행형 패키지 및 디지털 서명 적용.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/download`,
        label: "앱 다운로드하기",
      }),
      h(LinkButton, {
        url: appUrl,
        label: "공식 홈 바로가기",
      })
    )
  );
}

/**
 * 8. Legal / Terms Page Component Embed (/legal/terms)
 */
export function buildTermsEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Legal",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 서비스 이용약관](${appUrl}/legal/terms)\n**2026년 10월 25일 정식 시행**\nNextUps 서비스 이용과 관련된 회원과 회사의 권리, 의무 및 책임사항을 규정합니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/legal/terms`,
        label: "이용약관 전문 보기",
      }),
      h(LinkButton, {
        url: `${appUrl}/legal/privacy`,
        label: "개인정보처리방침",
      })
    )
  );
}

/**
 * 9. Legal / Privacy Page Component Embed (/legal/privacy)
 */
export function buildPrivacyEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Privacy",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 개인정보처리방침](${appUrl}/legal/privacy)\n**2026년 10월 25일 정식 시행**\n개인정보보호법에 의거하여 이용자의 소중한 개인정보를 안전하게 보호하고 처리하는 기준을 안내합니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/legal/privacy`,
        label: "개인정보처리방침 전문",
      }),
      h(LinkButton, {
        url: `${appUrl}/legal/privacy-notice`,
        label: "수집·이용 동의 확인",
      })
    )
  );
}

/**
 * 10. Legal / Privacy Notice Component Embed (/legal/privacy-notice)
 */
export function buildPrivacyNoticeEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Privacy Notice",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [개인정보 수집 및 이용 동의](${appUrl}/legal/privacy-notice)\n**NextUps 회원 서비스 제공을 위한 법정 고지**\n수집하는 개인정보 항목, 처리 목적 및 보유 기간을 투명하게 안내합니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/legal/privacy-notice`,
        label: "수집동의 고지 전문",
      }),
      h(LinkButton, {
        url: `${appUrl}/legal/privacy`,
        label: "개인정보처리방침",
      })
    )
  );
}

/**
 * 11. Admin Audit Log Page Component Embed (/admin/logs/[id])
 */
export function buildAuditLogEmbed(
  log: {
    id: string;
    title: string;
    action: string;
    details?: any;
    userEmail?: string | null;
  },
  appUrl = DEFAULT_APP_URL
) {
  const isPatch = log.action === "UPDATE_CREATE";
  const gameName = log.details?.game;
  const version = log.details?.version;
  const sourceUrl = log.details?.sourceUrl;
  const updateId = log.details?.updateId;

  let textContent = `NextUps 보안 감사 시스템 • \`${log.action}\`\n# [NextUps 로그] ${log.title}\n`;
  if (isPatch && gameName) {
    textContent += `**게임 타이틀**: ${gameName} (${version || "최신"})\n공식 패치노트가 시스템에 실시간 수집 및 등록되었습니다.`;
  } else {
    const detailSnippet = log.userEmail ? `계정: ${log.userEmail}` : `유형: ${log.action}`;
    textContent += `보안 감사 로그가 안전하게 기록되었습니다. (${detailSnippet})`;
  }

  const buttons: any[] = [];
  if (updateId) {
    buttons.push(
      h(LinkButton, {
        url: `${appUrl}/updates/${updateId}`,
        label: "패치노트 전문 보기",
      })
    );
  } else if (sourceUrl) {
    buttons.push(
      h(LinkButton, {
        url: sourceUrl,
        label: "공식 원본 출처 열기",
      })
    );
  }

  buttons.push(
    h(LinkButton, {
      url: `${appUrl}/admin/logs/${log.id}`,
      label: "보안 감사 로그 확인",
    })
  );

  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Security",
        }),
      },
      h(TextDisplay, null, textContent)
    ),
    h(Separator, { divider: true, spacing: "small" }),
    (h as any)(ActionRow, null, ...buttons)
  );
}

/**
 * 12. User Profile Page Component Embed (/profile/[code])
 */
export function buildProfileEmbed(
  user: {
    displayName?: string | null;
    email?: string | null;
    profileCode: string;
    avatarUrl?: string | null;
    role?: string;
    createdAt?: Date | string;
    followsCount?: number;
  },
  appUrl = DEFAULT_APP_URL
) {
  const name = user.displayName || user.profileCode;
  const roleText = user.role === "ADMIN" ? "NextUps 최고 관리자" : "NextUps 정회원";
  const followsText = user.followsCount !== undefined ? ` • 관심 게임 ${user.followsCount}개 구독` : "";
  const avatar = user.avatarUrl || `${appUrl}/logo.png`;

  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: avatar,
          description: `${name} Profile`,
        }),
      },
      h(
        TextDisplay,
        null,
        `# [${name}님의 프로필](${appUrl}/profile/${user.profileCode})\n**${roleText}**${followsText}\nNextUps에서 실시간 멀티플랫폼 게임 업데이트 및 맞춤 패치 알림을 받아보고 있습니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/profile/${user.profileCode}`,
        label: "프로필 전체보기",
      }),
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "게임 목록 탐색",
      })
    )
  );
}

/**
 * 13. Youth Protection Page Component Embed (/legal/youth)
 */
export function buildYouthEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Youth Protection",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 청소년 보호정책](${appUrl}/legal/youth)\n**청소년이 유해정보로부터 안전한 클린 플랫폼 환경 조성**\n청소년 보호법 및 정보통신망법에 의거한 보호 조치 및 실시간 모니터링 기준을 안내합니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/legal/youth`,
        label: "청소년 보호정책 전문",
      }),
      h(LinkButton, {
        url: `${appUrl}/legal/terms`,
        label: "서비스 이용약관",
      })
    )
  );
}

/**
 * 14. Personal Privacy Notice Receipt Embed (/legal/privacy-notice/[code])
 */
export function buildPrivacyNoticeUserEmbed(
  user: {
    displayName?: string | null;
    profileCode: string;
    createdAt?: Date | string;
  },
  appUrl = DEFAULT_APP_URL
) {
  const name = user.displayName || user.profileCode;
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Privacy Agreement Receipt",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [개인정보 이용·제공 내역 열람 증명](${appUrl}/legal/privacy-notice/${user.profileCode})\n**회원: ${name} (식별코드: ${user.profileCode})**\n개인정보 보호법 제20조의2에 따른 법정 개인정보 이용·제공 내역 공식 열람 증명서입니다.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/legal/privacy-notice/${user.profileCode}`,
        label: "열람 증명서 확인",
      }),
      h(LinkButton, {
        url: `${appUrl}/profile/${user.profileCode}`,
        label: "내 프로필로 이동",
      })
    )
  );
}

/**
 * 15. Notifications Page Component Embed (/notifications)
 */
export function buildNotificationsEmbed(appUrl = DEFAULT_APP_URL) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps Notifications",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [NextUps 알림 센터](${appUrl}/notifications)\n**구독 중인 관심 게임의 최신 패치 및 시스템 알림**\n실시간으로 도착한 게임 업데이트와 중요 변경 사항을 확인하세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/notifications`,
        label: "알림함 확인하기",
      }),
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "관심 게임 둘러보기",
      })
    )
  );
}

/**
 * 16. Generic Page Component Embed
 */
export function buildGenericEmbed(
  title: string,
  description: string,
  path: string,
  buttonLabel = "자세히 보기",
  appUrl = DEFAULT_APP_URL
) {
  return h(
    Container,
    { accentColor: 0x2563eb },
    h(
      Section,
      {
        accessory: h(Thumbnail, {
          url: `${appUrl}/logo.png`,
          description: "NextUps",
        }),
      },
      h(
        TextDisplay,
        null,
        `# [${title}](${appUrl}${path})\n${description}`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}${path}`,
        label: buttonLabel,
      }),
      h(LinkButton, {
        url: appUrl,
        label: "NextUps 홈",
      })
    )
  );
}

export {
  toComponentEmbedJson,
  toComponentEmbedScript,
  componentEmbedResponse,
};
