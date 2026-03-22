import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Single shared client per Node process (dev HMR + production workers).
 * Omitting the global in production can multiply connections across hot reloads.
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"],
    });

globalForPrisma.prisma = prisma;
