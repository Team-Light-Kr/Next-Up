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
  console.log("=== Discord Component V2 Links Broadcaster ===");

  // 1. 최신 업데이트 1개 가져오기
  const latestUpdate = await prisma.update.findFirst({
    orderBy: { releaseDate: "desc" },
    include: { game: true },
  });

  const links = [
    { title: "🏠 메인 홈 (Home Hub)", url: `${APP_URL}/` },
    { title: "🎮 게임 목록 전체 탐색 (Games Directory)", url: `${APP_URL}/games` },
    { title: "🖥️ 인기 PC 게임 상세 (Cyberpunk 2077)", url: `${APP_URL}/games/cyberpunk-2077` },
    { title: "🎮 닌텐도 독점작 상세 (Zelda: Tears of the Kingdom)", url: `${APP_URL}/games/zelda-totk` },
    { title: "⚡ 플레이스테이션 독점작 상세 (Marvel's Spider-Man 2)", url: `${APP_URL}/games/spiderman-2` },
    {
      title: `📜 최신 패치노트 상세 (${latestUpdate?.game?.canonicalName || "게임"} ${latestUpdate?.version || ""})`,
      url: `${APP_URL}/updates/${latestUpdate?.id || ""}`,
    },
    { title: "💻 Windows 플랫폼 허브", url: `${APP_URL}/platforms/windows` },
    { title: "🔵 PlayStation 플랫폼 허브", url: `${APP_URL}/platforms/playstation` },
    { title: "🔴 Nintendo Switch 플랫폼 허브", url: `${APP_URL}/platforms/nintendo` },
    { title: "📲 데스크톱 & 모바일 앱 다운로드 센터", url: `${APP_URL}/download` },
    { title: "⚖️ 게임 비교 분석 허브 (Compare)", url: `${APP_URL}/compare` },
    { title: "📋 서비스 이용약관 (Terms of Service)", url: `${APP_URL}/legal/terms` },
    { title: "🔒 개인정보처리방침 (Privacy Policy)", url: `${APP_URL}/legal/privacy` },
  ];

  console.log(`총 ${links.length}개의 주요 서비스 링크를 웹훅으로 전송합니다...`);

  // 안내 헤더 발송
  await sendToDiscord({
    username: "NextUps Component V2 Broadcaster",
    avatar_url: `${APP_URL}/logo.png`,
    content: `📢 **[NextUps] 링크 임베드 컴포넌트 V2 전체 검증 발송**\n새롭게 업데이트된 닌텐도/플스 탭 및 정사각 로고, 버전 정규화가 적용된 전 사이트 주요 페이지 링크입니다. Discord의 Component Embed V2 및 OpenGraph 카드 렌더링을 확인하세요.`,
  });

  await sleep(1200);

  let successCount = 0;
  for (const item of links) {
    console.log(`전송 중: ${item.title} -> ${item.url}`);
    try {
      const res = await sendToDiscord({
        username: "NextUps Component V2",
        avatar_url: `${APP_URL}/logo.png`,
        content: `**${item.title}**\n${item.url}`,
      });
      console.log(`  └ 결과: HTTP ${res.status}`);
      if (res.status >= 200 && res.status < 300) {
        successCount++;
      }
    } catch (e) {
      console.error(`  └ 에러:`, e.message);
    }
    // Rate limit 방지를 위해 1.2초 대기
    await sleep(1200);
  }

  console.log(`\n전송 완료: ${successCount} / ${links.length} 개 링크 발송 성공`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
