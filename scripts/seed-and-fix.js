const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STEAM_APP_MAP = {
  "cs2": 730,
  "dota-2": 570,
  "apex-legends": 1172470,
  "cyberpunk-2077": 1091500,
  "terraria": 105600,
  "pubg-battlegrounds": 578080,
  "baldurs-gate-3": 1086940,
  "palworld": 1623730,
  "elden-ring": 1245620,
  "helldivers-2": 553850,
  "stardew-valley": 413150,
  "hades": 1145360,
  "hades-ii": 1145350,
  "warframe": 230410,
  "rust": 252490,
  "gta-v": 271590
};

async function run() {
  console.log("=== 1. Upserting 6 Standard Platforms ===");
  const standardPlatforms = [
    { key: "windows", name: "Windows", description: "PC Windows (Steam, Epic Games 등) 환경의 최신 패치", icon: "Monitor", order: 1 },
    { key: "playstation", name: "PlayStation", description: "PlayStation 5 / PlayStation 4 콘솔 환경의 최신 패치", icon: "Gamepad2", order: 2 },
    { key: "nintendo", name: "Nintendo Switch", description: "닌텐도 스위치(Nintendo Switch) 콘솔 환경의 최신 패치", icon: "Gamepad2", order: 3 },
    { key: "android", name: "Android", description: "Google Play Store 및 안드로이드 모바일 패치", icon: "Smartphone", order: 4 },
    { key: "ios", name: "iOS", description: "Apple App Store 및 iOS 모바일 패치", icon: "Apple", order: 5 },
    { key: "macos", name: "macOS", description: "Mac App Store 및 Apple Silicon 환경 패치", icon: "Laptop", order: 6 },
  ];

  for (const sp of standardPlatforms) {
    await prisma.platform.upsert({
      where: { key: sp.key },
      update: { name: sp.name, description: sp.description, icon: sp.icon, enabled: true, order: sp.order },
      create: { key: sp.key, name: sp.name, description: sp.description, icon: sp.icon, enabled: true, order: sp.order },
    });
    console.log(`Platform upserted: ${sp.name} (${sp.key})`);
  }

  const allPlatforms = await prisma.platform.findMany();
  const pMap = new Map(allPlatforms.map(p => [p.key.toLowerCase(), p]));

  console.log("\n=== 2. Fetching Official Square Steam Icons via ICommunityService ===");
  const appIds = Object.values(STEAM_APP_MAP);
  const queryStr = appIds.map((id, idx) => `appids[${idx}]=${id}`).join('&');
  const steamRes = await fetch(`https://api.steampowered.com/ICommunityService/GetApps/v1/?${queryStr}`);
  const steamData = await steamRes.json().catch(() => null);
  const iconMap = {};
  if (steamData?.response?.apps) {
    for (const app of steamData.response.apps) {
      if (app.icon) {
        iconMap[app.appid] = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${app.appid}/${app.icon}.jpg`;
      }
    }
  }

  const dbGames = await prisma.game.findMany();
  for (const g of dbGames) {
    const appId = STEAM_APP_MAP[g.slug];
    const squareIcon = appId && iconMap[appId];
    if (squareIcon) {
      await prisma.game.update({
        where: { id: g.id },
        data: { iconUrl: squareIcon }
      });
      console.log(`Updated square icon for ${g.canonicalName}: ${squareIcon}`);
    }
  }

  console.log("\n=== 3. Fixing Placeholder Versions ('공식 정기 패치', '최신 확인 버전') ===");
  const updates = await prisma.update.findMany({
    orderBy: { releaseDate: "asc" }
  });

  for (const u of updates) {
    if (u.version.includes("공식 정기 패치") || u.version.includes("최신 확인") || !u.version) {
      // Extract from title
      let cleanVer = "";
      const semverMatch = u.title.match(/\b[vV]?(\d+\.\d+(?:\.\d+)?)\b/);
      const patchMatch = u.title.match(/\b(Patch|Hotfix|Update|Season|시즌|패치)\s*#?\s*(\d+(?:\.\d+)*)\b/i);
      const buildMatch = u.title.match(/\bBuild\s*#?\s*(\d+)\b/i);

      if (semverMatch) {
        cleanVer = `v${semverMatch[1]}`;
      } else if (patchMatch) {
        cleanVer = `${patchMatch[1]} ${patchMatch[2]}`;
      } else if (buildMatch) {
        cleanVer = `Build ${buildMatch[1]}`;
      } else {
        const d = new Date(u.releaseDate || u.createdAt);
        cleanVer = `v${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
      }

      await prisma.update.update({
        where: { id: u.id },
        data: { version: cleanVer }
      });
      console.log(`Fixed update [${u.title.slice(0, 30)}] version -> ${cleanVer}`);
    }
  }

  console.log("\n=== 4. Updating GamePlatform latestKnownVersion ===");
  const allGamePlatforms = await prisma.gamePlatform.findMany({
    include: {
      game: {
        include: {
          updates: {
            orderBy: { releaseDate: "desc" },
            take: 1
          }
        }
      }
    }
  });

  for (const gp of allGamePlatforms) {
    const latestUpdate = gp.game.updates[0];
    const goodVersion = (gp.latestKnownVersion && !gp.latestKnownVersion.includes("공식 정기 패치") && !gp.latestKnownVersion.includes("최신 확인"))
      ? gp.latestKnownVersion
      : (latestUpdate?.version || "v1.0.0");

    await prisma.gamePlatform.update({
      where: { id: gp.id },
      data: { latestKnownVersion: goodVersion }
    });
    console.log(`GamePlatform [${gp.game.canonicalName}] latestKnownVersion -> ${goodVersion}`);
  }

  console.log("\n=== 5. Seeding Nintendo & PlayStation Console Games ===");
  const consoleGames = [
    {
      slug: "zelda-totk",
      name: "젤다의 전설 티어스 오브 더 킹덤 (The Legend of Zelda: Tears of the Kingdom)",
      platformKey: "nintendo",
      developer: "Nintendo EPD",
      publisher: "Nintendo",
      iconUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://www.nintendo.co.kr/switch/zelda_totk/",
      genres: ["오픈월드", "액션 어드벤처", "RPG"],
      version: "v1.2.1",
      title: "젤다의 전설 티어스 오브 더 킹덤 Ver 1.2.1 업데이트 배포 안내",
      summary: "특정 조건에서 메인 챌린지를 진행할 수 없는 문제 해결 및 맵 핀 표시 오류 등 게임 플레이 편의성 개선",
      bodyMarkdown: `# 젤다의 전설 티어스 오브 더 킹덤 Ver 1.2.1 업데이트\n\nNintendo Switch 소프트웨어 **'젤다의 전설 티어스 오브 더 킹덤'**의 최신 업데이트 데이터(Ver 1.2.1)가 배포되었습니다.\n\n## 갱신 내용\n- **메인 챌린지 버그 수정**: 특정 챌린지 도중 이벤트가 정상적으로 발생하지 않아 진행이 불가능했던 현상을 수정하였습니다.\n- **맵 핀 기능 개선**: 맵에 배치한 핀이 특정 상황에서 비정상적으로 소멸되거나 위치가 어긋나던 문제를 수정하였습니다.\n- **요정의 샘 연출 최적화**: 대요정의 샘 개방 연출 시 간헐적으로 프레임 드롭이 발생하는 문제를 개선하였습니다.`
    },
    {
      slug: "pokemon-scarlet-violet",
      name: "포켓몬스터 스칼렛·바이올렛 (Pokémon Scarlet & Violet)",
      platformKey: "nintendo",
      developer: "GAME FREAK",
      publisher: "The Pokémon Company / Nintendo",
      iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://pokemonkorea.co.kr/scarlet_violet",
      genres: ["RPG", "오픈월드", "멀티플레이어"],
      version: "v3.0.1",
      title: "포켓몬스터스칼렛·바이올렛 업데이트 데이터(Ver.3.0.1) 배포 안내",
      summary: "통신 배틀 시 특정 기술/특성 비정상 처리 수정 및 DLC 후편 '남청의 원반' 블루레크 미션 동기화 안정화",
      bodyMarkdown: `# 포켓몬스터스칼렛·바이올렛 Ver.3.0.1 업데이트\n\nNintendo Switch 전용 소프트웨어 **'포켓몬스터스칼렛·바이올렛'**의 Ver.3.0.1 업데이트 안내입니다.\n\n## 주요 수정 사항\n- **통신 배틀 및 기술 판정**: 데미지 계산 및 특성 발동 우선도 정규화.\n- **DLC '제로의 비보' 후편 남청의 원반 버그 픽스**: 도구 프린터 이용 시 간헐적 충돌 해결.`
    },
    {
      slug: "marvel-spider-man-2",
      name: "마블 스파이더맨 2 (Marvel's Spider-Man 2)",
      platformKey: "playstation",
      developer: "Insomniac Games",
      publisher: "Sony Interactive Entertainment",
      iconUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://blog.ko.playstation.com/",
      genres: ["액션 어드벤처", "오픈월드", "히어로"],
      version: "v1.003.000",
      title: "PlayStation 5 마블 스파이더맨 2 신규 게임+ 및 기능 업데이트 v1.003.000",
      summary: "새 게임+(New Game+) 모드 지원, 미션 리플레이 기능 및 헬하운드 슈트 등 신규 스타일 추가",
      bodyMarkdown: `# 마블 스파이더맨 2 - 타이틀 업데이트 v1.003.000\n\nPlayStation 5 전용 대작 **마블 스파이더맨 2**의 최신 업데이트 정보입니다.\n\n## 신규 기능\n- **새 게임+ (New Game+)**: 클리어 후 세이브 데이터를 인계하여 궁극 난이도로 다시 시작 가능.\n- **미션 리플레이 & 시간대 변경**: 포토 모드에서 낮/노을/야간 시간대 자유 조절.`
    },
    {
      slug: "god-of-war-ragnarok",
      name: "갓 오브 워 라그나로크 (God of War Ragnarök)",
      platformKey: "playstation",
      developer: "Santa Monica Studio",
      publisher: "Sony Interactive Entertainment",
      iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://www.playstation.com/ko-kr/games/god-of-war-ragnarok/",
      genres: ["액션", "어드벤처", "신화"],
      version: "v05.05",
      title: "PlayStation 5 / PS4 갓 오브 워 라그나로크 v05.05 패치 노트",
      summary: "발할라(Valhalla) 무료 DLC 호환성 강화, 포토 모드 크래시 픽스 및 컴패니언 AI 동선 개선",
      bodyMarkdown: `# 갓 오브 워 라그나로크 v05.05 패치\n\nPlayStation 5 및 PlayStation 4를 위한 **갓 오브 워 라그나로크** v05.05 패치입니다.\n\n## 패치 하이라이트\n- **발할라 모드 최적화**: 성소 장비 퍽 누락 버그 수정.\n- **PS5 성능 및 그래픽 최적화**: 120Hz 및 VRR 모드 안정성 향상.`
    }
  ];

  for (const cg of consoleGames) {
    const targetPlat = pMap.get(cg.platformKey);
    if (!targetPlat) continue;

    const game = await prisma.game.upsert({
      where: { slug: cg.slug },
      update: {
        canonicalName: cg.name,
        developer: cg.developer,
        publisher: cg.publisher,
        iconUrl: cg.iconUrl,
        coverImageUrl: cg.coverImageUrl,
        officialWebsiteUrl: cg.officialWebsiteUrl,
        genres: cg.genres,
        status: "ACTIVE"
      },
      create: {
        slug: cg.slug,
        canonicalName: cg.name,
        description: `${cg.name}의 ${targetPlat.name} 공식 실시간 패치노트와 업데이트 정보입니다.`,
        developer: cg.developer,
        publisher: cg.publisher,
        iconUrl: cg.iconUrl,
        coverImageUrl: cg.coverImageUrl,
        officialWebsiteUrl: cg.officialWebsiteUrl,
        genres: cg.genres,
        status: "ACTIVE"
      }
    });

    const gp = await prisma.gamePlatform.upsert({
      where: {
        gameId_platformId: {
          gameId: game.id,
          platformId: targetPlat.id
        }
      },
      update: {
        latestKnownVersion: cg.version,
        lastCheckedAt: new Date()
      },
      create: {
        gameId: game.id,
        platformId: targetPlat.id,
        availabilityStatus: "AVAILABLE",
        latestKnownVersion: cg.version,
        lastCheckedAt: new Date()
      }
    });

    const existingUpdate = await prisma.update.findFirst({
      where: {
        gameId: game.id,
        platformId: targetPlat.id,
        version: cg.version
      }
    });

    if (!existingUpdate) {
      await prisma.update.create({
        data: {
          gameId: game.id,
          platformId: targetPlat.id,
          gamePlatformId: gp.id,
          version: cg.version,
          title: cg.title,
          releaseDate: new Date(),
          summary: cg.summary,
          bodyMarkdown: cg.bodyMarkdown,
          updateType: "MAJOR",
          isVerified: true,
          sourceUrl: cg.officialWebsiteUrl,
          sourceName: `${targetPlat.name} 공식 패치노트`,
          images: [cg.coverImageUrl]
        }
      });
      console.log(`Created console update for ${game.canonicalName}: ${cg.version}`);
    }
  }

  // Cross-link existing titles to PlayStation & Nintendo
  const crossMap = {
    "elden-ring": ["playstation"],
    "cyberpunk-2077": ["playstation"],
    "baldurs-gate-3": ["playstation"],
    "hades": ["nintendo", "playstation"],
    "stardew-valley": ["nintendo", "playstation"],
    "terraria": ["nintendo", "playstation"],
    "apex-legends": ["nintendo", "playstation"],
  };

  for (const [slug, plats] of Object.entries(crossMap)) {
    const game = await prisma.game.findUnique({
      where: { slug },
      include: {
        updates: { orderBy: { releaseDate: "desc" }, take: 1 }
      }
    });
    if (!game) continue;
    const latestVer = game.updates[0]?.version || "v1.0.0";

    for (const pKey of plats) {
      const plat = pMap.get(pKey);
      if (!plat) continue;

      const cgp = await prisma.gamePlatform.upsert({
        where: {
          gameId_platformId: {
            gameId: game.id,
            platformId: plat.id
          }
        },
        update: {
          latestKnownVersion: latestVer,
          lastCheckedAt: new Date()
        },
        create: {
          gameId: game.id,
          platformId: plat.id,
          availabilityStatus: "AVAILABLE",
          latestKnownVersion: latestVer,
          lastCheckedAt: new Date()
        }
      });

      const existUp = await prisma.update.findFirst({
        where: {
          gameId: game.id,
          platformId: plat.id
        }
      });

      if (!existUp && game.updates[0]) {
        const orig = game.updates[0];
        await prisma.update.create({
          data: {
            gameId: game.id,
            platformId: plat.id,
            gamePlatformId: cgp.id,
            version: orig.version,
            title: `[${plat.name}] ${orig.title}`,
            releaseDate: orig.releaseDate,
            summary: orig.summary,
            bodyMarkdown: orig.bodyMarkdown,
            updateType: orig.updateType,
            isVerified: true,
            sourceUrl: orig.sourceUrl,
            sourceName: `${plat.name} 공식 지원`,
            images: orig.images
          }
        });
        console.log(`Cross-linked ${game.canonicalName} to ${plat.name} (${orig.version})`);
      }
    }
  }

  console.log("\n=== Complete! ===");
}

run().catch(console.error).finally(() => prisma.$disconnect());
