/**
 * Database Seed Script
 * Creates initial users and sample master data for development
 * Run: npx prisma db seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // USERS — 3 demo accounts (admin, mitra, operator)
  // ============================================================
  const admin = await prisma.user.upsert({
    where: { email: "admin@plts-tracker.com" },
    update: {},
    create: {
      email: "admin@plts-tracker.com",
      name: "Seagate Admin",
      password: "admin123", // Mock mode — plain text OK
      role: "admin",
    },
  });

  const mitra = await prisma.user.upsert({
    where: { email: "mitra@plts-tracker.com" },
    update: {},
    create: {
      email: "mitra@plts-tracker.com",
      name: "Budi Mitra",
      password: "mitra123",
      role: "mitra",
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operator@plts-tracker.com" },
    update: {},
    create: {
      email: "operator@plts-tracker.com",
      name: "Andi Operator",
      password: "operator123",
      role: "operator",
    },
  });

  console.log("✅ Users created:", { admin: admin.email, mitra: mitra.email, operator: operator.email });

  // ============================================================
  // PRODUCTS — Sample PLTS products
  // ============================================================
  const products = await Promise.all([
    prisma.product.upsert({
      where: { code: "PV-001" },
      update: {},
      create: {
        code: "PV-001",
        name: "Panel Surya 450W Monocrystalline",
        category: "Panel Surya",
        unit: "pcs",
        reorderPoint: 5,
        description: "Panel surya monocrystalline 450Wp, efisiensi 21.3%",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "PV-002" },
      update: {},
      create: {
        code: "PV-002",
        name: "Panel Surya 550W Monocrystalline",
        category: "Panel Surya",
        unit: "pcs",
        reorderPoint: 5,
        description: "Panel surya monocrystalline 550Wp, half-cut cell",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "INV-001" },
      update: {},
      create: {
        code: "INV-001",
        name: "Inverter Hybrid 5kW",
        category: "Inverter",
        unit: "unit",
        reorderPoint: 3,
        description: "Hybrid inverter 5kW, MPPT dual tracker",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "INV-002" },
      update: {},
      create: {
        code: "INV-002",
        name: "Inverter On-Grid 3kW",
        category: "Inverter",
        unit: "unit",
        reorderPoint: 3,
        description: "On-grid inverter 3kW, single phase",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "BAT-001" },
      update: {},
      create: {
        code: "BAT-001",
        name: "Baterai LiFePO4 5.12kWh",
        category: "Baterai",
        unit: "unit",
        reorderPoint: 3,
        description: "Baterai lithium iron phosphate 51.2V 100Ah",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "MNT-001" },
      update: {},
      create: {
        code: "MNT-001",
        name: "Mounting Rail Aluminium 4m",
        category: "Mounting",
        unit: "pcs",
        reorderPoint: 20,
        description: "Aluminium mounting rail untuk atap miring, 4 meter",
        createdBy: admin.id,
      },
    }),
    prisma.product.upsert({
      where: { code: "KBL-001" },
      update: {},
      create: {
        code: "KBL-001",
        name: "Kabel Solar 6mm² PV1-F",
        category: "Kabel & Konektor",
        unit: "meter",
        reorderPoint: 100,
        description: "Kabel solar DC 6mm², rated 1800V, UV resistant",
        createdBy: admin.id,
      },
    }),
  ]);

  console.log(`✅ Products created: ${products.length} items`);

  // ============================================================
  // INSTALLERS — Sample installer/mitra
  // ============================================================
  const installers = await Promise.all([
    prisma.installer.upsert({
      where: { code: "INS-A" },
      update: {},
      create: {
        code: "INS-A",
        name: "PT Solar Prima Indonesia",
        picName: "Ahmad Surya",
        phone: "081234567890",
        city: "Jakarta",
        priceScheme: "Harga A",
        notes: "Mitra utama, volume besar",
        createdBy: admin.id,
      },
    }),
    prisma.installer.upsert({
      where: { code: "INS-B" },
      update: {},
      create: {
        code: "INS-B",
        name: "CV Energi Mandiri",
        picName: "Budi Cahaya",
        phone: "082345678901",
        city: "Yogyakarta",
        priceScheme: "Harga B",
        notes: "Installer lokal Jogja",
        createdBy: admin.id,
      },
    }),
    prisma.installer.upsert({
      where: { code: "INS-C" },
      update: {},
      create: {
        code: "INS-C",
        name: "PT Sinar Jaya Energi",
        picName: "Citra Dewi",
        phone: "083456789012",
        city: "Surabaya",
        priceScheme: "Harga A",
        notes: "Installer Jawa Timur",
        createdBy: admin.id,
      },
    }),
    prisma.installer.upsert({
      where: { code: "INS-D" },
      update: {},
      create: {
        code: "INS-D",
        name: "CV Matahari Energy",
        picName: "Dedi Pratama",
        phone: "084567890123",
        city: "Semarang",
        priceScheme: "Harga C",
        createdBy: admin.id,
      },
    }),
  ]);

  console.log(`✅ Installers created: ${installers.length} items`);

  // ============================================================
  // STOCK BATCHES — Sample batches
  // ============================================================
  const batches = await Promise.all([
    prisma.stockBatch.upsert({
      where: { batchNumber: "BCH-2504-001" },
      update: {},
      create: {
        batchNumber: "BCH-2504-001",
        productId: products[0].id, // Panel 450W
        supplierName: "PT JA Solar Indonesia",
        entryDate: new Date("2026-04-01"),
        qtyIn: 20,
        hppPerUnit: 2_100_000,
        totalHpp: 20 * 2_100_000,
        notes: "Batch pertama April",
        createdBy: admin.id,
      },
    }),
    prisma.stockBatch.upsert({
      where: { batchNumber: "BCH-2504-002" },
      update: {},
      create: {
        batchNumber: "BCH-2504-002",
        productId: products[2].id, // Inverter 5kW
        supplierName: "PT Growatt Indonesia",
        entryDate: new Date("2026-04-05"),
        qtyIn: 10,
        hppPerUnit: 8_500_000,
        totalHpp: 10 * 8_500_000,
        notes: "Inverter hybrid batch April",
        createdBy: admin.id,
      },
    }),
    prisma.stockBatch.upsert({
      where: { batchNumber: "BCH-2504-003" },
      update: {},
      create: {
        batchNumber: "BCH-2504-003",
        productId: products[4].id, // Baterai
        supplierName: "PT Pylontech Indonesia",
        entryDate: new Date("2026-04-10"),
        qtyIn: 8,
        hppPerUnit: 7_200_000,
        totalHpp: 8 * 7_200_000,
        notes: "Baterai LiFePO4 batch April",
        createdBy: admin.id,
      },
    }),
  ]);

  console.log(`✅ Stock batches created: ${batches.length} items`);

  // ============================================================
  // PROFIT SHARING CONFIG
  // ============================================================
  await Promise.all([
    prisma.profitSharingConfig.create({
      data: {
        partyName: "Seagate (Owner)",
        role: "owner",
        sharePercentage: 60,
        effectiveFrom: new Date("2026-01-01"),
        createdBy: admin.id,
      },
    }),
    prisma.profitSharingConfig.create({
      data: {
        partyName: "Budi (Investor)",
        role: "investor",
        sharePercentage: 40,
        effectiveFrom: new Date("2026-01-01"),
        createdBy: admin.id,
      },
    }),
  ]);

  console.log("✅ Profit sharing config created");
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
