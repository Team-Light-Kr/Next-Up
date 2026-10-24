import { PrismaClient } from "@prisma/client";

// Sanitize process.env.DATABASE_URL immediately at module load time
if (process.env.DATABASE_URL) {
  let cleanUrl = process.env.DATABASE_URL;
  // If Supabase pooler is set to port 5432 (Session mode with 15 client limit), switch to port 6543 (Transaction mode)
  if (cleanUrl.includes("pooler.supabase.com:5432")) {
    cleanUrl = cleanUrl.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }

  // Ensure pgbouncer=true and connection_limit=1 for Next.js / serverless connection management
  if (!cleanUrl.includes("pgbouncer=true")) {
    const separator = cleanUrl.includes("?") ? "&" : "?";
    cleanUrl += `${separator}pgbouncer=true`;
  }
  if (!cleanUrl.includes("connection_limit=")) {
    cleanUrl += `&connection_limit=1`;
  }

  process.env.DATABASE_URL = cleanUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;

export default prisma;
