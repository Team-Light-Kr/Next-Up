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
        `# [NextUps](${appUrl})\n**멀티플랫폼 게임 업데이트 정보 통합 플랫폼**\nWindows, Android, iOS 공식 최신 패치노트와 버전 정보를 실시간으로 확인하세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "최신 게임 패치 보기",
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
        `# [NextUps 게임 디렉터리](${appUrl}/games)${countText}\n**멀티플랫폼 게임 패치 및 버전 검색**\nPC Windows, 모바일 안드로이드, iOS의 최신 업데이트 내역과 패치노트를 탐색해보세요.`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/games`,
        label: "게임 목록 전체보기",
      }),
      h(LinkButton, {
        url: `${appUrl}/compare`,
        label: "플랫폼 버전 비교하기",
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
          url: game.iconUrl || `${appUrl}/logo.png`,
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
          url: update.game.iconUrl || `${appUrl}/logo.png`,
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

  return h(
    Container,
    { accentColor: 0x2563eb },
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
        `# [${platform.name} 게임 허브](${appUrl}/platforms/${platform.key})${countDesc}\n${desc}`
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
        `# [NextUps 플랫폼 버전 비교](${appUrl}/compare)\n**플랫폼별 버전 격차 및 동기화 현황 분석**\nWindows, Android, iOS 간의 버전 불일치와 크로스플랫폼 패치 현황을 한눈에 비교하세요.`
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
  const detailSnippet = log.userEmail ? `계정: ${log.userEmail}` : `유형: ${log.action}`;

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
      h(
        TextDisplay,
        null,
        `NextUps 보안 감사 시스템 • \`${log.action}\`\n# [NextUps 로그] ${log.title}\n보안 감사 로그가 안전하게 기록되었습니다. (${detailSnippet})`
      )
    ),
    h(Separator, { divider: true, spacing: "small" }),
    h(
      ActionRow,
      null,
      h(LinkButton, {
        url: `${appUrl}/admin/logs/${log.id}`,
        label: "관리자 로그 상세 확인",
      }),
      h(LinkButton, {
        url: `${appUrl}/admin/dashboard`,
        label: "관리자 대시보드",
      })
    )
  );
}

export {
  toComponentEmbedJson,
  toComponentEmbedScript,
  componentEmbedResponse,
};
