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
 * 1. Root / Home Page Component Embed
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
 * 2. Game Detail Page Component Embed
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
 * 3. Update / Patch Note Page Component Embed
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
 * 4. Admin Audit Log Page Component Embed
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

/**
 * 5. Download Page Component Embed
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
        `# [NextUps 다운로드](${appUrl}/download)\n**NextUps 공식 데스크톱 및 모바일 앱**\nWindows 전용 프로그램 및 안드로이드 APK 앱을 바로 다운로드할 수 있습니다.`
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

export {
  toComponentEmbedJson,
  toComponentEmbedScript,
  componentEmbedResponse,
};
