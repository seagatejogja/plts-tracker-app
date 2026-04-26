import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all batches with their sales to calculate remaining stock
    const batches = await prisma.stockBatch.findMany({
      include: {
        product: true,
        salesTransactions: {
          select: { qtySold: true }
        }
      },
      orderBy: { entryDate: "asc" }, // FIFO order: oldest batches first
    });

    const availableBatches = batches.map(batch => {
      const totalSold = batch.salesTransactions.reduce((sum, sale) => sum + sale.qtySold, 0);
      const availableStock = batch.qtyIn - totalSold;

      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        productId: batch.productId,
        productName: batch.product.name,
        productCode: batch.product.code,
        hppPerUnit: batch.hppPerUnit,
        availableStock,
        entryDate: batch.entryDate,
      };
    }).filter(batch => batch.availableStock > 0);

    return NextResponse.json(availableBatches);
  } catch (error) {
    console.error("Failed to fetch available batches:", error);
    return NextResponse.json({ error: "Gagal mengambil data batch yang tersedia" }, { status: 500 });
  }
}
