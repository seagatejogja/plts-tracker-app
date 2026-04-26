/**
 * Prisma Client Singleton
 * Prevents multiple instances during development hot-reload
 * Prisma v7 — uses better-sqlite3 adapter for local dev
 */
import { PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with SQLite adapter
 * In production, this will be swapped for Supabase PostgreSQL adapter
 */
function createPrismaClient(): PrismaClient {
  // If we have a DATABASE_URL (production/postgresql), use standard Prisma
  if (process.env.DATABASE_URL) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Fallback to SQLite adapter for local dev (Note: This requires schema to be compatible or re-generated)
  const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db"
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/**
 * Singleton Prisma client instance
 * Re-uses existing instance in development to avoid connection pool exhaustion
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
