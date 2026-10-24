import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting NextUp database seeding...");

  // 1. Platforms
  const platformsData = [
    { key: "windows", name: "Windows", description: "PC Windows 환경 (Steam, Epic Games, 전용 런처)", order: 1 },
    { key: "android", name: "Android", description: "Google Play Store 및 안드로이드 기기", order: 2 },
    { key: "ios", name: "iOS", description: "Apple App Store (iPhone, iPad)", order: 3 },
    { key: "macos", name: "macOS", description: "Mac App Store 및 Apple Silicon 지원 환경", order: 4 },
  ];

  const platforms = {};
  for (const p of platformsData) {
    platforms[p.key] = await prisma.platform.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description, order: p.order },
      create: p,
    });
  }
  console.log("Platforms seeded: Windows, Android, iOS, macOS");

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nextups.xyz" },
    update: {},
    create: {
      email: "admin@nextups.xyz",
      displayName: "NextUp 관리자",
      role: "ADMIN",
      profileCode: "admin001",
      bio: "NextUp 공식 관리 계정입니다.",
      status: "ACTIVE",
    },
  });
  console.log("Admin user seeded:", adminUser.email);

  // 3. Games & Updates
  // Game 1: Genshin Impact
  const genshin = await prisma.game.upsert({
    where: { slug: "genshin-impact" },
    update: {},
    create: {
      slug: "genshin-impact",
      canonicalName: "원신 (Genshin Impact)",
      localizedNames: { ko: "원신", en: "Genshin Impact", ja: "原神", zh: "原神" },
      description: "호요버스(HoYoverse)가 개발한 오픈월드 어드벤처 RPG. 티바트 대륙에서 7가지 원소가 살아 숨쉬는 광활한 세상을 탐험합니다.",
      iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=160&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://genshin.hoyoverse.com/ko",
      developer: "HoYoverse",
      publisher: "COGNOSPHERE",
      genres: ["오픈월드", "액션 RPG", "어드벤처"],
      status: "ACTIVE",
    },
  });

  // GamePlatform connections for Genshin
  const genshinWin = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: genshin.id, platformId: platforms.windows.id } },
    update: { latestKnownVersion: "v5.4.0", lastCheckedAt: new Date() },
    create: {
      gameId: genshin.id,
      platformId: platforms.windows.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v5.4.0",
      storeUrl: "https://genshin.hoyoverse.com/ko/download",
      lastCheckedAt: new Date(),
    },
  });

  const genshinIos = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: genshin.id, platformId: platforms.ios.id } },
    update: { latestKnownVersion: "v5.4.0", lastCheckedAt: new Date() },
    create: {
      gameId: genshin.id,
      platformId: platforms.ios.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v5.4.0",
      storeUrl: "https://apps.apple.com/kr/app/genshin-impact/id1517783697",
      lastCheckedAt: new Date(),
    },
  });

  const genshinAndroid = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: genshin.id, platformId: platforms.android.id } },
    update: { latestKnownVersion: "v5.4.0", lastCheckedAt: new Date() },
    create: {
      gameId: genshin.id,
      platformId: platforms.android.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v5.4.0",
      storeUrl: "https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact",
      lastCheckedAt: new Date(),
    },
  });

  // Genshin Updates
  const genshinWinUpdate = await prisma.update.create({
    data: {
      gameId: genshin.id,
      platformId: platforms.windows.id,
      gamePlatformId: genshinWin.id,
      version: "v5.4.0",
      title: "5.4 버전 「달콤한 꿈의 부름」 정식 업데이트",
      releaseDate: new Date("2025-02-12T11:00:00Z"),
      summary: "신규 캐릭터 출시, 나타 지역 신규 맵 확장, 새로운 전설 임무 및 다양한 기간 한정 이벤트가 시작됩니다.",
      bodyMarkdown: `## 5.4 버전 업데이트 상세 안내

원신이 5.4 버전 「달콤한 꿈의 부름」으로 업데이트되었습니다.

### 주요 변경 사항
1. **신규 캐릭터 및 무기 추가**
   - 5성 캐릭터 신규 픽업 기원 진행
   - 전용 무기 및 4성 이벤트 무기 지급
2. **시스템 개선 및 최적화**
   - 성유물 빠른 잠금 및 자동 필터 설정 추가
   - PC 클라이언트 그래픽 렌더링 성능 최적화
3. **버그 수정**
   - 특정 지형에서 등반 모션이 끊기던 현상 해결
   - 협동 모드에서 음성 채팅 연결 끊김 현상 수정

공식 공지 전문은 아래 링크에서 확인하실 수 있습니다.`,
      updateType: "MAJOR",
      isVerified: true,
      sourceUrl: "https://genshin.hoyoverse.com/ko/news/detail/123456",
      sourceName: "호요버스 공식 공지",
      sourceType: "OFFICIAL_SITE",
      sections: {
        create: [
          { title: "신규 캐릭터 및 이벤트", content: "신규 5성 캐릭터 픽업과 기간 한정 보상 이벤트가 진행됩니다.", order: 1 },
          { title: "시스템 최적화", content: "성유물 일괄 잠금 기능 추가 및 그래픽 설정 옵션이 확장되었습니다.", order: 2 },
          { title: "버그 수정", content: "일부 전투 스킬 연출 및 텍스처 이상 현상이 수정되었습니다.", order: 3 },
        ],
      },
    },
  });

  // Game 2: Blue Archive
  const blueArchive = await prisma.game.upsert({
    where: { slug: "blue-archive" },
    update: {},
    create: {
      slug: "blue-archive",
      canonicalName: "블루 아카이브 (Blue Archive)",
      localizedNames: { ko: "블루 아카이브", en: "Blue Archive", ja: "ブルーアーカイブ", zh: "蔚蓝档案" },
      description: "넥슨게임즈가 개발한 학원 도시 키보토스를 배경으로 펼쳐지는 캐릭터 수집형 모바일 전략 RPG.",
      iconUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://bluearchive.nexon.com",
      developer: "NEXON Games",
      publisher: "NEXON",
      genres: ["수집형 RPG", "서브컬처", "전략"],
      status: "ACTIVE",
    },
  });

  const baIos = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: blueArchive.id, platformId: platforms.ios.id } },
    update: { latestKnownVersion: "v1.65.239", lastCheckedAt: new Date() },
    create: {
      gameId: blueArchive.id,
      platformId: platforms.ios.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v1.65.239",
      storeUrl: "https://apps.apple.com/kr/app/id1570597022",
      lastCheckedAt: new Date(),
    },
  });

  const baAndroid = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: blueArchive.id, platformId: platforms.android.id } },
    update: { latestKnownVersion: "v1.65.239", lastCheckedAt: new Date() },
    create: {
      gameId: blueArchive.id,
      platformId: platforms.android.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v1.65.239",
      storeUrl: "https://play.google.com/store/apps/details?id=com.nexon.bluearchive",
      lastCheckedAt: new Date(),
    },
  });

  await prisma.update.create({
    data: {
      gameId: blueArchive.id,
      platformId: platforms.android.id,
      gamePlatformId: baAndroid.id,
      version: "v1.65.239",
      title: "정기 점검 및 신규 이벤트 스토리 업데이트",
      releaseDate: new Date("2025-02-18T05:00:00Z"),
      summary: "신규 이벤트 스토리 개방, 신규 학생 모집, 종합전술시험 시즌 및 카페 편의성 기능이 추가되었습니다.",
      bodyMarkdown: `## 블루 아카이브 정기 점검 업데이트 안내

선생님, 키보토스에 새로운 소식이 도착했습니다!

### 점검 내역
- **신규 이벤트 스토리**: 키보토스 축제 스토리 1부 개방
- **학생 모집**: 신규 한정 학생 픽업 시작
- **전술 대항전**: 시즌 보상 정산 및 랭킹 초기화
- **편의성 개선**: 가구 일괄 배치 및 학생 선물 바로가기 기능 추가`,
      updateType: "MINOR",
      isVerified: true,
      sourceUrl: "https://forum.nexon.com/bluearchive",
      sourceName: "넥슨 공식 포럼",
      sourceType: "OFFICIAL_NOTICE",
    },
  });

  // Game 3: Valorant
  const valorant = await prisma.game.upsert({
    where: { slug: "valorant" },
    update: {},
    create: {
      slug: "valorant",
      canonicalName: "발로란트 (VALORANT)",
      localizedNames: { ko: "발로란트", en: "VALORANT", ja: "ヴァロラント", zh: "无畏契约" },
      description: "라이엇 게임즈의 5대5 캐릭터 기반 1인칭 전술 슈팅 게임. 정밀한 총기 사격과 고유 스킬이 결합된 경쟁전 플레이를 제공합니다.",
      iconUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=160&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://playvalorant.com/ko-kr/",
      developer: "Riot Games",
      publisher: "Riot Games",
      genres: ["FPS", "전술 슈팅", "경쟁"],
      status: "ACTIVE",
    },
  });

  const valWin = await prisma.gamePlatform.upsert({
    where: { gameId_platformId: { gameId: valorant.id, platformId: platforms.windows.id } },
    update: { latestKnownVersion: "v9.11", lastCheckedAt: new Date() },
    create: {
      gameId: valorant.id,
      platformId: platforms.windows.id,
      availabilityStatus: "AVAILABLE",
      latestKnownVersion: "v9.11",
      storeUrl: "https://playvalorant.com/ko-kr/download/",
      lastCheckedAt: new Date(),
    },
  });

  await prisma.update.create({
    data: {
      gameId: valorant.id,
      platformId: platforms.windows.id,
      gamePlatformId: valWin.id,
      version: "v9.11",
      title: "발로란트 패치 노트 9.11",
      releaseDate: new Date("2025-02-10T14:00:00Z"),
      summary: "요원 밸런스 조정, 맵 충돌 판정 개선, 뱅가드(Vanguard) 보안 엔진 업데이트가 적용되었습니다.",
      bodyMarkdown: `## 발로란트 9.11 패치 안내

이번 패치에서는 경쟁전 안정성 강화 및 일부 요원의 스킬 지속시간 밸런싱이 진행되었습니다.

### 요원 업데이트
- **바이퍼**: 독구름 지속 시간 및 연료 소모율 소폭 조정
- **오멘**: 피해망상 발사 궤적 가시성 개선

### 시스템 및 뱅가드
- 윈도우 환경에서의 프레임 드롭 현상 디스패치 최적화`,
      updateType: "PATCH",
      isVerified: true,
      sourceUrl: "https://playvalorant.com/ko-kr/news/game-updates/valorant-patch-notes-9-11/",
      sourceName: "발로란트 공식 홈페이지",
      sourceType: "OFFICIAL_SITE",
    },
  });

  // Game 4: Minecraft
  const minecraft = await prisma.game.upsert({
    where: { slug: "minecraft" },
    update: {},
    create: {
      slug: "minecraft",
      canonicalName: "마인크래프트 (Minecraft)",
      localizedNames: { ko: "마인크래프트", en: "Minecraft", ja: "マインクラフト", zh: "我的世界" },
      description: "모장 스튜디오가 개발한 세계 최고의 샌드박스 게임. 블록을 쌓아 상상하는 모든 것을 창조하고 모험할 수 있습니다.",
      iconUrl: "https://images.unsplash.com/photo-1627856014754-2907e2355d54?w=160&auto=format&fit=crop&q=80",
      coverImageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      officialWebsiteUrl: "https://www.minecraft.net",
      developer: "Mojang Studios",
      publisher: "Xbox Game Studios",
      genres: ["샌드박스", "생존", "어드벤처"],
      status: "ACTIVE",
    },
  });

  // Minecraft across all 4 platforms!
  for (const pKey of ["windows", "macos", "android", "ios"]) {
    await prisma.gamePlatform.upsert({
      where: { gameId_platformId: { gameId: minecraft.id, platformId: platforms[pKey].id } },
      update: { latestKnownVersion: "1.21.51", lastCheckedAt: new Date() },
      create: {
        gameId: minecraft.id,
        platformId: platforms[pKey].id,
        availabilityStatus: "AVAILABLE",
        latestKnownVersion: "1.21.51",
        storeUrl: "https://www.minecraft.net/download",
        lastCheckedAt: new Date(),
      },
    });

    await prisma.update.create({
      data: {
        gameId: minecraft.id,
        platformId: platforms[pKey].id,
        version: "1.21.51",
        title: `마인크래프트 ${platforms[pKey].name} 1.21.51 핫픽스 패치`,
        releaseDate: new Date("2025-02-15T18:00:00Z"),
        summary: "일부 크래시 문제 해결 및 렐름(Realms) 연결 안정성 개선이 포함된 핫픽스 릴리스입니다.",
        bodyMarkdown: `## 마인크래프트 1.21.51 핫픽스 릴리스

${platforms[pKey].name} 버전 마인크래프트의 안정성 핫픽스가 배포되었습니다.

### 수정 사항
- 게임 실행 시 특정 환경에서 발생하던 간헐적 크래시 수정
- 블록 파괴 애니메이션 싱크 오류 수정
- 멀티플레이 렐름 서버와의 패킷 전송 효율화`,
        updateType: "HOTFIX",
        isVerified: true,
        sourceUrl: "https://feedback.minecraft.net",
        sourceName: "Mojang 피드백 공식",
        sourceType: "OFFICIAL_SITE",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
