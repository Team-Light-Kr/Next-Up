const { PrismaClient } = require("@prisma/client");
const https = require("https");
const { URL } = require("url");

const prisma = new PrismaClient();
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/1563366419079495741/g4aDzEmLMUwtjiBkIYiFC8uACG4tUrdtC__ai6ZFdnlpMnj4LR83kmYrJSf--qFbm7H7";
const APP_URL = "https://www.nextups.xyz";

function sendToDiscord(payload) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(WEBHOOK_URL);
    const data = JSON.stringify(payload);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("=== Discord Component V2 Pure Links Broadcaster (with www.) ===");

  // Fetch real games and updates from DB
  const games = await prisma.game.findMany({
    select: { slug: true, canonicalName: true },
    take: 6,
  });

  const latestUpdate = await prisma.update.findFirst({
    orderBy: { releaseDate: "desc" },
    include: { game: true },
  });

  const compareUpdates = await prisma.update.findMany({
    take: 2,
    orderBy: { releaseDate: "desc" },
  });

  const links = [
    { name: "메인 홈", url: `${APP_URL}/` },
    { name: "전체 게임 목록", url: `${APP_URL}/games` },
    ...games.map((g) => ({
      name: `게임 상세: ${g.canonicalName}`,
      url: `${APP_URL}/games/${g.slug}`,
    })),
    ...(latestUpdate
      ? [
          {
            name: `최신 패치노트: ${latestUpdate.game.canonicalName} (${latestUpdate.version})`,
            url: `${APP_URL}/updates/${latestUpdate.id}`,
          },
        ]
      : []),
    { name: "Windows 플랫폼", url: `${APP_URL}/platforms/windows` },
    { name: "PlayStation 5 플랫폼", url: `${APP_URL}/platforms/ps5` },
    { name: "Nintendo Switch 플랫폼", url: `${APP_URL}/platforms/switch` },
    { name: "앱 다운로드 센터", url: `${APP_URL}/download` },
    {
      name: "패치 버전 상세 비교 도구",
      url:
        compareUpdates.length >= 2
          ? `${APP_URL}/compare?left=${compareUpdates[1].id}&right=${compareUpdates[0].id}`
          : `${APP_URL}/compare`,
    },
    { name: "서비스 이용약관", url: `${APP_URL}/legal/terms` },
    { name: "개인정보처리방침", url: `${APP_URL}/legal/privacy` },
  ];

  console.log(`총 ${links.length}개 링크가 링크 맨 앞에 www. (https://www.nextups.xyz)를 적용하여 웹훅으로 발송됩니다...`);

  // 안내 메시지
  await sendToDiscord({
    username: "NextUps Component V2",
    avatar_url: `${APP_URL}/logo.png`,
    content: `🔔 **[NextUps] 컴포넌트 V2 링크 임베드 전송 (모든 링크 맨 앞에 \`www.\` 적용 완료)**\n모든 URL이 \`https://www.nextups.xyz/...\` 형식으로 전송되어 Discord Component Embed V2 카드가 즉시 렌더링됩니다.`,
  });

  await sleep(1500);

  let successCount = 0;
  for (const item of links) {
    console.log(`[전송] ${item.name}: ${item.url}`);
    try {
      const res = await sendToDiscord({
        username: "NextUps",
        avatar_url: `${APP_URL}/logo.png`,
        content: item.url,
      });
      console.log(`  └ 응답: HTTP ${res.status}`);
      if (res.status >= 200 && res.status < 300) {
        successCount++;
      }
    } catch (e) {
      console.error(`  └ 에러:`, e.message);
    }
    await sleep(1500);
  }

  console.log(`\n발송 완료: ${successCount} / ${links.length} 개 링크 발송 완료`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
