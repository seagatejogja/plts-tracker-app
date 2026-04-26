import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.count();
  const installers = await prisma.installer.count();
  const batches = await prisma.stockBatch.count();
  const sales = await prisma.salesTransaction.count();
  const users = await prisma.user.findMany({ select: { email: true, role: true } });

  console.log("--- DB STATUS ---");
  console.log("Products:", products);
  console.log("Installers:", installers);
  console.log("Batches:", batches);
  console.log("Sales:", sales);
  console.log("Users:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
