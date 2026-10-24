const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding games and multi-version updates for comparison tool...");

  // Platforms
  const windows = await prisma.platform.upsert({
    where: { key: "windows" },
    update: { name: "Windows" },
    create: { key: "windows", name: "Windows", enabled: true, order: 1 },
  });

  const ps5 = await prisma.platform.upsert({
    where: { key: "ps5" },
    update: { name: "PlayStation 5" },
    create: { key: "ps5", name: "PlayStation 5", enabled: true, order: 2 },
  });

  const switchPlat = await prisma.platform.upsert({
    where: { key: "switch" },
    update: { name: "Nintendo Switch" },
    create: { key: "switch", name: "Nintendo Switch", enabled: true, order: 3 },
  });

  // Game 1: 도타 2 (Dota 2)
  const dota = await prisma.game.upsert({
    where: { slug: "dota-2" },
    update: {
      canonicalName: "도타 2 (Dota 2)",
      description: "밸브 코퍼레이션에서 개발 및 배포하는 최고의 전략 AOS 게임 도타 2입니다.",
      iconUrl: "/images/games/dota2-icon.png",
      coverImageUrl: "/images/games/dota2-banner.jpg",
      officialWebsiteUrl: "https://www.dota2.com",
    },
    create: {
      slug: "dota-2",
      canonicalName: "도타 2 (Dota 2)",
      description: "밸브 코퍼레이션에서 개발 및 배포하는 최고의 전략 AOS 게임 도타 2입니다.",
      iconUrl: "/images/games/dota2-icon.png",
      coverImageUrl: "/images/games/dota2-banner.jpg",
      officialWebsiteUrl: "https://www.dota2.com",
    },
  });

  const gpDota = await prisma.gamePlatform.upsert({
    where: {
      gameId_platformId: {
        gameId: dota.id,
        platformId: windows.id,
      },
    },
    update: {},
    create: {
      gameId: dota.id,
      platformId: windows.id,
    },
  });

  // Dota 2 - Update 1 (이전 버전: v2026.08.27)
  await prisma.update.create({
    data: {
      gameId: dota.id,
      platformId: windows.id,
      gamePlatformId: gpDota.id,
      version: "v2026.08.27",
      title: "The International 2026 Grand Championship Patch",
      releaseDate: new Date("2026-08-27T12:00:00Z"),
      sourceUrl: "https://www.dota2.com/patches/7.41e",
      summary: "TI 2026 결승을 앞둔 메타 밸런스 조정 및 영웅 고유 패싯 개선 패치입니다.",
      bodyMarkdown: `### 🏆 The International 2026 대회 기념 밸런스 패치

본 패치는 챔피언십 본선 메타를 안정화하고 과도한 지속 전투 능력을 보유한 핵심 영웅들을 미세 조정하기 위해 배포되었습니다.

#### ⚔️ 일반 게임플레이 변경점
- **로샨(Roshan)**: 2번째 처치 시 보상으로 지급되던 재생의 구슬 파편 지속시간이 90초에서 75초로 감소했습니다.
- **포탈 이동 속도**: 양 진영 트윈 게이트 이동 채널링 시간이 3초에서 3.5초로 증가했습니다.
- **경험치 룬**: 7분 주기 생성 경험치 룬의 기본 경험치 제공량이 10% 감소했습니다.

#### 🧙 영웅 밸런스
- **원소술사 (Invoker)**:
  - *혼돈의 운석*: 충돌 시 0.2초 기절 부여 효과 삭제, 이동속도 감소율 40%로 상향
  - 기본 민첩 1 감소 (14 -> 13)
- **그림자 마귀 (Shadow Fiend)**:
  - *영혼 포식*: 영혼 1개당 공격력 보너스가 +2에서 +1.8로 조정
- **태엽장이 (Clockwerk)**:
  - *동력망*: 반경이 210에서 225로 확대`,
    },
  });

  // Dota 2 - Update 2 (신규 버전: v2026.09.16)
  await prisma.update.create({
    data: {
      gameId: dota.id,
      platformId: windows.id,
      gamePlatformId: gpDota.id,
      version: "v2026.09.16",
      title: "7.41f Gameplay Patch",
      releaseDate: new Date("2026-09-16T09:30:00Z"),
      sourceUrl: "https://www.dota2.com/patches/7.41f",
      summary: "가을 시즌 게임플레이 7.41f 업데이트, 아이템 개편 및 신규 영웅 반응성 최적화가 적용되었습니다.",
      bodyMarkdown: `### 🍂 7.41f 게임플레이 패치 노트

가을 시즌을 맞이하여 주요 중립 아이템 시스템 재조정과 서포터 경제 시스템 완화가 적용되었습니다.

#### 🛠️ 시스템 및 아이템 개편
- **중립 아이템 티어 3**:
  - *팔라딘 소드*: 체력 흡수율 16% -> 18%로 증가
  - *속삭임의 망토*: 은신 중 이동 속도 +10% 추가
- **서포터 골드 지원**:
  - 와드 설치 보상 현상금이 15% 증가했습니다.
  - 연막의 물약 충전 대기시간이 120초에서 105초로 단축되었습니다.

#### ⚔️ 영웅 상향 및 조정
- **원소술사 (Invoker)**:
  - *EMP*: 마나 연소 비율이 대상 최대 마나의 25%에서 28%로 상향
- **암살 기사 (Templar Assassin)**:
  - *굴절*: 피해 무효화 횟수가 3/4/5/6에서 4/5/6/7로 증가
- **퍼지 (Pudge)**:
  - *고기 갈고리*: 투사체 비행 속도가 1600에서 1700으로 상향 조정`,
    },
  });

  // Game 2: 카운터 스트라이크 2 (Counter-Strike 2)
  const cs2 = await prisma.game.upsert({
    where: { slug: "counter-strike-2" },
    update: {
      canonicalName: "카운터 스트라이크 2 (CS2)",
      description: "밸브의 전설적인 1인칭 전술 슈팅 게임, 소스 2 엔진으로 진화한 카운터 스트라이크 2입니다.",
      iconUrl: "/images/games/cs2-icon.png",
      coverImageUrl: "/images/games/cs2-banner.jpg",
      officialWebsiteUrl: "https://www.counter-strike.net",
    },
    create: {
      slug: "counter-strike-2",
      canonicalName: "카운터 스트라이크 2 (CS2)",
      description: "밸브의 전설적인 1인칭 전술 슈팅 게임, 소스 2 엔진으로 진화한 카운터 스트라이크 2입니다.",
      iconUrl: "/images/games/cs2-icon.png",
      coverImageUrl: "/images/games/cs2-banner.jpg",
      officialWebsiteUrl: "https://www.counter-strike.net",
    },
  });

  const gpCs2 = await prisma.gamePlatform.upsert({
    where: {
      gameId_platformId: {
        gameId: cs2.id,
        platformId: windows.id,
      },
    },
    update: {},
    create: {
      gameId: cs2.id,
      platformId: windows.id,
    },
  });

  await prisma.update.create({
    data: {
      gameId: cs2.id,
      platformId: windows.id,
      gamePlatformId: gpCs2.id,
      version: "1.40.2.1",
      title: "서브틱 반응성 및 볼류메트릭 연막탄 최적화",
      releaseDate: new Date("2026-09-02T10:00:00Z"),
      sourceUrl: "https://store.steampowered.com/news/app/730",
      summary: "서브틱 패킷 지연을 감소시키고 수류탄 폭발 시 연막탄 상호작용 렌더링 성능을 개선했습니다.",
      bodyMarkdown: `### 🎯 CS2 빌드 1.40.2.1 릴리즈

- **서브틱 아키텍처**:
  - 이동 정지 시 프레임간 보간 정밀도를 향상하여 입력 딜레이 체감 개선
- **연막탄(Smoke Grenade)**:
  - HE 수류탄 폭발 시 연막이 일시적으로 걷히는 지속시간 0.3초 증가
- **오디오**:
  - 발소리 오클루전 필터링 정확도 향상`,
    },
  });

  await prisma.update.create({
    data: {
      gameId: cs2.id,
      platformId: windows.id,
      gamePlatformId: gpCs2.id,
      version: "1.40.3.0",
      title: "더스트 2 맵 리워크 및 경쟁전 매치메이킹 업데이트",
      releaseDate: new Date("2026-09-28T14:30:00Z"),
      sourceUrl: "https://store.steampowered.com/news/app/730",
      summary: "Dust II B 사이트 지형 가시성 조정과 프리미어 레이팅 계산 방식이 개편되었습니다.",
      bodyMarkdown: `### 💣 CS2 빌드 1.40.3.0 메이저 업데이트

- **맵 (Dust II)**:
  - B 사이트 도어 입구 조명 밝기 상향으로 캐릭터 시인성 대폭 개선
  - A 롱 코너 픽 각도 픽스
- **프리미어 모드**:
  - 연승 보너스 레이팅 배점 공식 재산정
- **무기 반동**:
  - M4A4 첫 발 스프레드 회복 속도 소폭 상향`,
    },
  });

  // Game 3: 갓 오브 워 라그나로크 (God of War Ragnarök) - PS5
  const gow = await prisma.game.upsert({
    where: { slug: "god-of-war-ragnarok" },
    update: {
      canonicalName: "갓 오브 워 라그나로크 (God of War Ragnarök)",
      description: "산타 모니카 스튜디오의 북유럽 신화 액션 어드벤처 대작입니다.",
      iconUrl: "/images/games/gow-icon.png",
      coverImageUrl: "/images/games/gow-banner.jpg",
      officialWebsiteUrl: "https://www.playstation.com/games/god-of-war-ragnarok/",
    },
    create: {
      slug: "god-of-war-ragnarok",
      canonicalName: "갓 오브 워 라그나로크 (God of War Ragnarök)",
      description: "산타 모니카 스튜디오의 북유럽 신화 액션 어드벤처 대작입니다.",
      iconUrl: "/images/games/gow-icon.png",
      coverImageUrl: "/images/games/gow-banner.jpg",
      officialWebsiteUrl: "https://www.playstation.com/games/god-of-war-ragnarok/",
    },
  });

  const gpGow = await prisma.gamePlatform.upsert({
    where: {
      gameId_platformId: {
        gameId: gow.id,
        platformId: ps5.id,
      },
    },
    update: {},
    create: {
      gameId: gow.id,
      platformId: ps5.id,
    },
  });

  await prisma.update.create({
    data: {
      gameId: gow.id,
      platformId: ps5.id,
      gamePlatformId: gpGow.id,
      version: "05.01",
      title: "PlayStation 5 발할라(Valhalla) DLC 안정성 패치",
      releaseDate: new Date("2026-08-15T08:00:00Z"),
      sourceUrl: "https://support.sms.playstation.com",
      summary: "로그라이크 모드 진행 중 세이브 손실 버그 수정 및 DualSense 햅틱 피드백 강화.",
      bodyMarkdown: `### ⚡ 갓 오브 워 라그나로크 v05.01

- **발할라 모드**:
  - 성소 보물 상자 개방 시 특정 룬 각인이 비정상 적용되던 문제 해결
  - 아레나 진입 로딩 시 간헐적 텍스처 스트리밍 지연 수정
- **듀얼센스(DualSense)**:
  - 블레이즈 오브 카오스 패링 시 어댑티브 트리거 저항력 세분화`,
    },
  });

  await prisma.update.create({
    data: {
      gameId: gow.id,
      platformId: ps5.id,
      gamePlatformId: gpGow.id,
      version: "05.04",
      title: "PS5 Pro 인핸스드 60FPS 레이 트레이싱 모드 지원",
      releaseDate: new Date("2026-10-12T04:00:00Z"),
      sourceUrl: "https://support.sms.playstation.com",
      summary: "PSSR 업스케일링 및 고해상도 그래픽 모드 프레임 드랍 완화.",
      bodyMarkdown: `### 🌟 갓 오브 워 라그나로크 v05.04

- **그래픽 모드**:
  - PSSR 기반 동적 4K 해상도 모드 기본 탑재
  - 그림자 및 반사 레이 트레이싱 품질 상향
- **접근성**:
  - 자막 크기 초대형 옵션 및 한국어 음성 싱크 개선`,
    },
  });

  // Game 4: 젤다의 전설 티어스 오브 더 킹덤 (Nintendo Switch)
  const zelda = await prisma.game.upsert({
    where: { slug: "zelda-tears-of-the-kingdom" },
    update: {
      canonicalName: "젤다의 전설 티어스 오브 더 킹덤 (TotK)",
      description: "끝없는 모험이 펼쳐지는 하이랄의 하늘과 지저를 무대로 한 닌텐도의 오픈월드 어드벤처입니다.",
      iconUrl: "/images/games/zelda-icon.png",
      coverImageUrl: "/images/games/zelda-banner.jpg",
      officialWebsiteUrl: "https://www.nintendo.com/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/",
    },
    create: {
      slug: "zelda-tears-of-the-kingdom",
      canonicalName: "젤다의 전설 티어스 오브 더 킹덤 (TotK)",
      description: "끝없는 모험이 펼쳐지는 하이랄의 하늘과 지저를 무대로 한 닌텐도의 오픈월드 어드벤처입니다.",
      iconUrl: "/images/games/zelda-icon.png",
      coverImageUrl: "/images/games/zelda-banner.jpg",
      officialWebsiteUrl: "https://www.nintendo.com/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/",
    },
  });

  const gpZelda = await prisma.gamePlatform.upsert({
    where: {
      gameId_platformId: {
        gameId: zelda.id,
        platformId: switchPlat.id,
      },
    },
    update: {},
    create: {
      gameId: zelda.id,
      platformId: switchPlat.id,
    },
  });

  await prisma.update.create({
    data: {
      gameId: zelda.id,
      platformId: switchPlat.id,
      gamePlatformId: gpZelda.id,
      version: "1.2.0",
      title: "울트라핸드 조작 안정화 및 사당 챌린지 오류 수정",
      releaseDate: new Date("2026-07-20T03:00:00Z"),
      sourceUrl: "https://en-americas-support.nintendo.com",
      summary: "일부 사당에서 구슬이 지형에 끼이던 현상 및 블루프린트 즐겨찾기 복원 패치입니다.",
      bodyMarkdown: `### 🗡️ 젤다의 전설 TotK Ver. 1.2.0

- **울트라핸드 & 블루프린트**:
  - 대형 조나우 기어 조합 시 파츠 분리 버그 픽스
  - 등록 즐겨찾기 히스토리 보존 슬롯 안정화
- **퀘스트 진행**:
  - 지저 특정 뿌리 점등 후 지도 동기화 오류 해결`,
    },
  });

  await prisma.update.create({
    data: {
      gameId: zelda.id,
      platformId: switchPlat.id,
      gamePlatformId: gpZelda.id,
      version: "1.2.1",
      title: "화면 깜빡임 완화 및 음향 환경음 패치",
      releaseDate: new Date("2026-09-10T02:00:00Z"),
      sourceUrl: "https://en-americas-support.nintendo.com",
      summary: "하이랄 하늘섬 및 지저 이동 시 앰비언트 사운드 왜곡과 프레임 드랍을 개선했습니다.",
      bodyMarkdown: `### 🛡️ 젤다의 전설 TotK Ver. 1.2.1

- **시스템 안정성**:
  - 지저와 지상을 고속 낙하할 때 발생하는 순간적인 버벅임 최적화
  - 맵 핀 개수 최대치 도달 시 UI 경고창 미표시 오류 수정
- **오디오**:
  - 폭풍우 환경음 볼륨 밸런스 조정`,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
