import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNumber, saleDate, installerId, paymentStatus, notes, items, createdBy } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Minimal harus ada 1 item yang dijual" }, { status: 400 });
    }

    // Check if invoice number already exists
    const existing = await prisma.salesTransaction.findFirst({
      where: { invoiceNumber },
    });

    if (existing) {
      return NextResponse.json({ error: "Nomor faktur/invoice sudah digunakan" }, { status: 400 });
    }

    // Verify stock and prepare data
    const transactionData = [];
    
    for (const item of items) {
      // 1. Get the batch to check available stock and get HPP
      const batch = await prisma.stockBatch.findUnique({
        where: { id: item.batchId },
      });

      if (!batch) {
        return NextResponse.json({ error: `Batch stok tidak ditemukan` }, { status: 400 });
      }

      // Check how much of this batch has already been sold
      const previousSales = await prisma.salesTransaction.aggregate({
        where: { batchId: batch.id },
        _sum: { qtySold: true },
      });

      const totalSold = previousSales._sum.qtySold || 0;
      const availableStock = batch.qtyIn - totalSold;

      const qtyRequested = parseInt(item.qtySold);

      if (qtyRequested > availableStock) {
        return NextResponse.json({ 
          error: `Stok pada batch ${batch.batchNumber} tidak mencukupi. Sisa stok: ${availableStock}, diminta: ${qtyRequested}` 
        }, { status: 400 });
      }

      // 2. Calculate values
      const hppPerUnit = batch.hppPerUnit;
      const sellingPricePerUnit = parseFloat(item.sellingPricePerUnit);
      const totalHpp = qtyRequested * hppPerUnit;
      const totalRevenue = qtyRequested * sellingPricePerUnit;
      const grossProfit = totalRevenue - totalHpp;

      transactionData.push({
        invoiceNumber,
        saleDate: new Date(saleDate),
        installerId,
        batchId: item.batchId,
        productId: item.productId,
        qtySold: qtyRequested,
        hppPerUnit,
        sellingPricePerUnit,
        totalHpp,
        totalRevenue,
        grossProfit,
        paymentStatus,
        notes,
        createdBy,
      });
    }

    // Insert all items in a single transaction
    await prisma.$transaction(
      transactionData.map((data) => prisma.salesTransaction.create({ data }))
    );

    return NextResponse.json({ message: "Transaksi berhasil dicatat" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create sales transaction:", error);
    return NextResponse.json({ error: "Gagal memproses transaksi" }, { status: 500 });
  }
}
