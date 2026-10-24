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
  console.log("=== Discord Component V2 Pure Links Broadcaster ===");

  const latestUpdate = await prisma.update.findFirst({
    orderBy: { releaseDate: "desc" },
    include: { game: true },
  });

  const links = [
    { name: "메인 홈", url: `${APP_URL}/` },
    { name: "게임 디렉터리", url: `${APP_URL}/games` },
    { name: "사이버펑크 2077", url: `${APP_URL}/games/cyberpunk-2077` },
    { name: "갓 오브 워 라그나로크", url: `${APP_URL}/games/god-of-war-ragnarok` },
    { name: "마블 스파이더맨 2", url: `${APP_URL}/games/marvel-spider-man-2` },
    { name: "포켓몬스터 스칼렛 바이올렛", url: `${APP_URL}/games/pokemon-scarlet-violet` },
    { name: "젤다의 전설 티어스 오브 더 킹덤", url: `${APP_URL}/games/zelda-totk` },
    { name: "최신 패치노트 상세", url: `${APP_URL}/updates/${latestUpdate?.id || ""}` },
    { name: "Windows 플랫폼", url: `${APP_URL}/platforms/windows` },
    { name: "PlayStation 플랫폼", url: `${APP_URL}/platforms/playstation` },
    { name: "Nintendo Switch 플랫폼", url: `${APP_URL}/platforms/nintendo` },
    { name: "앱 다운로드", url: `${APP_URL}/download` },
    { name: "게임 비교 분석", url: `${APP_URL}/compare` },
    { name: "이용약관", url: `${APP_URL}/legal/terms` },
    { name: "개인정보처리방침", url: `${APP_URL}/legal/privacy` },
  ];

  console.log(`총 ${links.length}개 링크를 순수 링크 전송 방식으로 Discord 웹훅에 발송합니다...`);

  // 알림 공지
  await sendToDiscord({
    username: "NextUps Component V2",
    avatar_url: `${APP_URL}/logo.png`,
    content: `🔔 **[NextUps] 컴포넌트 V2 링크 임베드 전송 (콘솔 4개 게임 실제 공식 아트워크 & alternates 적용)**\nDiscord가 각 URL을 읽어 인터랙티브 Component Embed V2 카드로 미리보기를 생성합니다.`,
  });

  await sleep(2000);

  let successCount = 0;
  for (const item of links) {
    console.log(`[전송] ${item.name}: ${item.url}`);
    try {
      // 마크다운 꾸밈없이 순수 URL만 전송하여 Discord 자동 언펄/임베드 트리거
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
    // Discordbot unfurl 및 rate limit 방지를 위해 2초 대기
    await sleep(2000);
  }

  console.log(`\n발송 완료: ${successCount} / ${links.length} 개 링크 발송 완료`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
