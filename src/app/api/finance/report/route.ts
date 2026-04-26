import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Bulan dan Tahun wajib diisi" }, { status: 400 });
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Get aggregated data by product category
    const sales = await prisma.salesTransaction.findMany({
      where: {
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
      },
    });

    // Group by category
    const categoryStats = sales.reduce((acc: any, sale) => {
      const cat = sale.product.category;
      if (!acc[cat]) {
        acc[cat] = { category: cat, revenue: 0, profit: 0, items: 0 };
      }
      acc[cat].revenue += sale.totalRevenue;
      acc[cat].profit += sale.grossProfit;
      acc[cat].items += sale.qtySold;
      return acc;
    }, {});

    // Get profit sharing settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["investor_share", "manager_share"] } }
    });
    const investorRate = parseFloat(settings.find(s => s.key === "investor_share")?.value || "60") / 100;
    const managerRate = parseFloat(settings.find(s => s.key === "manager_share")?.value || "40") / 100;

    // Get operational expenses for this month
    const expenseData = await prisma.monthlyExpense.findUnique({
      where: { month_year: { month, year } }
    });
    const operationalExpense = expenseData?.amount || 0;

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const grossProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
    const netProfit = Math.max(0, grossProfit - operationalExpense);

    const summary = {
      totalRevenue,
      totalProfit: grossProfit,
      netProfit,
      operationalExpense,
      totalItems: sales.reduce((sum, s) => sum + s.qtySold, 0),
      categories: Object.values(categoryStats),
      sharing: {
        investorRate: investorRate * 100,
        managerRate: managerRate * 100,
        investorAmount: netProfit * investorRate,
        managerAmount: netProfit * managerRate,
      }
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Finance report error:", error);
    return NextResponse.json({ error: "Gagal memuat laporan keuangan" }, { status: 500 });
  }
}
