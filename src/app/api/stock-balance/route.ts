import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      }),
    };

    // Ambil data produk dengan pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          stockBatches: { select: { qtyIn: true } },
          salesTransactions: { select: { qtySold: true } },
        },
        orderBy: { category: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Hitung saldo stok per produk
    const data = products.map((product) => {
      const totalIn = product.stockBatches.reduce((sum, batch) => sum + batch.qtyIn, 0);
      const totalOut = product.salesTransactions.reduce((sum, sale) => sum + sale.qtySold, 0);
      const currentStock = totalIn - totalOut;
      
      // Tentukan status stok
      let status = "Aman";
      if (currentStock <= 0) {
        status = "Habis";
      } else if (currentStock <= product.reorderPoint) {
        status = "Kritis";
      }

      // Hapus data mentah relasi agar response lebih ringan
      const { stockBatches, salesTransactions, ...productData } = product;

      return {
        ...productData,
        totalIn,
        totalOut,
        currentStock,
        status,
      };
    });

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch stock balance:", error);
    return NextResponse.json({ error: "Gagal mengambil data saldo stok" }, { status: 500 });
  }
}
