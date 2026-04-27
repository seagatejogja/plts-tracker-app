/**
 * Prisma Client Singleton — PLTS Supply Tracker
 * Prevents multiple instances during development hot-reload
 * Connects to PostgreSQL (Supabase) via DATABASE_URL
 */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client for PostgreSQL (Supabase)
 * @returns PrismaClient instance configured with appropriate logging
 */
function createPrismaClient(): PrismaClient {
  const connectionString = `${process.env.DATABASE_URL}`;
  
  // Create pg pool (enforce SSL in production for Supabase)
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
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
