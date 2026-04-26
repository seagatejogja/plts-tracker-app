import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search } },
          { installer: { name: { contains: search } } },
        ],
      }),
    };

    // To handle pagination with grouping in SQLite/Prisma:
    // 1. Get all sales to group them (or use groupBy if metadata isn't complex)
    // For simplicity and to include related installer data, we fetch and group.
    const allSales = await prisma.salesTransaction.findMany({
      where: whereClause,
      include: {
        installer: true,
      },
      orderBy: { saleDate: "desc" },
    });

    // Group by invoiceNumber in JS
    const groupedSales = allSales.reduce((acc: Record<string, any>, curr) => {
      if (!acc[curr.invoiceNumber]) {
        acc[curr.invoiceNumber] = {
          invoiceNumber: curr.invoiceNumber,
          saleDate: curr.saleDate,
          installerName: curr.installer.name,
          installerCity: curr.installer.city,
          paymentStatus: curr.paymentStatus,
          totalItems: 0,
          totalRevenue: 0,
          grossProfit: 0,
          id: curr.id
        };
      }
      
      acc[curr.invoiceNumber].totalItems += curr.qtySold;
      acc[curr.invoiceNumber].totalRevenue += curr.totalRevenue;
      acc[curr.invoiceNumber].grossProfit += curr.grossProfit;
      
      return acc;
    }, {});

    const allInvoices = Object.values(groupedSales);
    const total = allInvoices.length;
    const invoices = allInvoices.slice(skip, skip + limit);

    return NextResponse.json({
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch sales transactions:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}
