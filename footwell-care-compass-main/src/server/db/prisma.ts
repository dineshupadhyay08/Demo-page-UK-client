import "server-only";
import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "@/server/logging/logger";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
// Fresh Neon connection measured at 3.788s; the previous 3s cap rejected it.
const DATABASE_CONNECT_TIMEOUT_SECONDS = 5;

function databaseUrlWithConnectTimeout(): string | undefined {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) return undefined;
  try {
    const parsed = new URL(databaseUrl);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", String(DATABASE_CONNECT_TIMEOUT_SECONDS));
    }
    return parsed.toString();
  } catch {
    return databaseUrl;
  }
}

const databaseUrl = databaseUrlWithConnectTimeout();
const prismaOptions: Prisma.PrismaClientOptions = databaseUrl
  ? { datasources: { db: { url: databaseUrl } } }
  : {};

const clientStartedAt = performance.now();
const clientReused = !!globalForPrisma.prisma;
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);
// Construction/cache retrieval is synchronous; this is NOT connection time.
logger.info("database.client_initialization", {
  reused: clientReused,
  durationMs: Math.round(performance.now() - clientStartedAt),
});

globalForPrisma.prisma = prisma;
