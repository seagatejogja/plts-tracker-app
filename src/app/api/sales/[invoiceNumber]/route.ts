import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;

    const items = await prisma.salesTransaction.findMany({
      where: { invoiceNumber },
      include: {
        product: true,
        batch: true,
        installer: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    // Since installer, invoiceNumber, saleDate, paymentStatus, and notes
    // are the same for all items in the invoice, we can extract them from the first item
    const firstItem = items[0];
    
    const invoiceDetail = {
      invoiceNumber: firstItem.invoiceNumber,
      saleDate: firstItem.saleDate,
      paymentStatus: firstItem.paymentStatus,
      notes: firstItem.notes,
      installer: firstItem.installer,
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.code,
        batchNumber: item.batch.batchNumber,
        qtySold: item.qtySold,
        hppPerUnit: item.hppPerUnit,
        sellingPricePerUnit: item.sellingPricePerUnit,
        totalHpp: item.totalHpp,
        totalRevenue: item.totalRevenue,
        grossProfit: item.grossProfit,
      })),
      summary: {
        totalItems: items.reduce((sum, item) => sum + item.qtySold, 0),
        totalRevenue: items.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalGrossProfit: items.reduce((sum, item) => sum + item.grossProfit, 0),
      }
    };

    return NextResponse.json(invoiceDetail);
  } catch (error) {
    console.error("Failed to fetch invoice details:", error);
    return NextResponse.json({ error: "Gagal mengambil data invoice" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;
    const body = await req.json();

    if (!body.paymentStatus) {
      return NextResponse.json({ error: "Status pembayaran tidak valid" }, { status: 400 });
    }

    // Update paymentStatus for all items under this invoice
    await prisma.salesTransaction.updateMany({
      where: { invoiceNumber },
      data: { paymentStatus: body.paymentStatus },
    });

    return NextResponse.json({ message: "Status pembayaran berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return NextResponse.json({ error: "Gagal memperbarui status pembayaran" }, { status: 500 });
  }
}
