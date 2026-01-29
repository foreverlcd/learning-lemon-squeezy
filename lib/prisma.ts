
import PrismaPkg from '@prisma/client';
const { PrismaClient } = PrismaPkg;


type PrismaClientType = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};



export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: 'file:./dev.db',
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
