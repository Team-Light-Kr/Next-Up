import { PrismaClient } from "@prisma/client";

function getSanitizedDbUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  let cleanUrl = url;
  // If Supabase pooler is set to port 5432 (Session mode limit 15 clients), switch to port 6543 (Transaction mode)
  if (cleanUrl.includes("pooler.supabase.com:5432")) {
    cleanUrl = cleanUrl.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }

  // Ensure pgbouncer=true and connection_limit=1 for Next.js / serverless concurrency
  if (!cleanUrl.includes("pgbouncer=true")) {
    const separator = cleanUrl.includes("?") ? "&" : "?";
    cleanUrl += `${separator}pgbouncer=true`;
  }
  if (!cleanUrl.includes("connection_limit=")) {
    cleanUrl += `&connection_limit=1`;
  }

  return cleanUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getSanitizedDbUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

export default prisma;
