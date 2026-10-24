const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all 4 games and their associated updates/records...");

  // 1. Delete notifications referencing games or updates
  await prisma.notification.deleteMany({}).catch((e) => console.log("notification delete:", e.message));

  // 2. Delete reports
  await prisma.report.deleteMany({}).catch((e) => console.log("report delete:", e.message));

  // 3. Delete Update translations if any
  if (prisma.updateTranslation) {
    await prisma.updateTranslation.deleteMany({}).catch((e) => console.log("updateTranslation delete:", e.message));
  }

  // 4. Delete Update sections if any
  if (prisma.updateSection) {
    await prisma.updateSection.deleteMany({}).catch((e) => console.log("updateSection delete:", e.message));
  }

  // 5. Delete updates
  const deletedUpdates = await prisma.update.deleteMany({});
  console.log(`Deleted ${deletedUpdates.count} updates.`);

  // 6. Delete GamePlatform
  const deletedGP = await prisma.gamePlatform.deleteMany({});
  console.log(`Deleted ${deletedGP.count} game platforms.`);

  // 7. Delete GameFollow
  const deletedGF = await prisma.gameFollow.deleteMany({});
  console.log(`Deleted ${deletedGF.count} game follows.`);

  // 8. Delete Games
  const deletedGames = await prisma.game.deleteMany({});
  console.log(`Deleted ${deletedGames.count} games.`);

  // 9. Clean up duplicate platforms if any (keep windows, android, ios, macos, ps5, switch, playstation, nintendo)
  // Let's inspect platforms
  const platforms = await prisma.platform.findMany();
  console.log("Current platforms:", platforms.map(p => ({ id: p.id, key: p.key, name: p.name })));

  // If there are duplicate platform names or keys, clean them up
  const seenNames = new Set();
  for (const plat of platforms) {
    if (seenNames.has(plat.name)) {
      console.log(`Removing duplicate platform: ${plat.name} (id: ${plat.id}, key: ${plat.key})`);
      await prisma.platform.delete({ where: { id: plat.id } }).catch(() => {});
    } else {
      seenNames.add(plat.name);
    }
  }

  console.log("All requested games and updates successfully deleted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
