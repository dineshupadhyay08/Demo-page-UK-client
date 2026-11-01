import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ construct: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/server/logging/logger", () => ({ logger: { info: vi.fn() } }));
vi.mock("@prisma/client", () => ({ PrismaClient: class {
  constructor(options: unknown) { mocks.construct(options); }
} }));
const cache = globalThis as typeof globalThis & { prisma?: unknown };
afterEach(() => { delete cache.prisma; vi.unstubAllEnvs(); vi.resetModules(); });
it.each(["development", "production"])("reuses one client across module reloads in %s", async environment => {
  delete cache.prisma;
  mocks.construct.mockClear();
  vi.stubEnv("NODE_ENV", environment);
  vi.stubEnv("DATABASE_URL", "postgresql://user:password@example.invalid/db?sslmode=require");
  vi.resetModules();
  const first = await import("@/server/db/prisma");
  vi.resetModules();
  const second = await import("@/server/db/prisma");
  expect(second.prisma).toBe(first.prisma);
  expect(mocks.construct).toHaveBeenCalledTimes(1);
  const options = mocks.construct.mock.calls[0]![0];
  expect(new URL(options.datasources.db.url).searchParams.get("connect_timeout")).toBe("5");
});
