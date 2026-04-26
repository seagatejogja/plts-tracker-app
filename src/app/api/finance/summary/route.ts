import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);

    // 1. Get Summary for current month
    const currentMonthStats = await prisma.salesTransaction.aggregate({
      where: {
        saleDate: {
          gte: currentStart,
          lte: currentEnd,
        },
      },
      _sum: {
        totalRevenue: true,
        grossProfit: true,
        totalHpp: true,
      },
    });

    const currentExpense = await prisma.monthlyExpense.findUnique({
      where: { month_year: { month: now.getMonth() + 1, year: now.getFullYear() } }
    });
    const opCost = currentExpense?.amount || 0;
    const currentNetProfit = Math.max(0, (currentMonthStats._sum.grossProfit || 0) - opCost);

    // 2. Get Trend for last 6 months
    const trend = [];
    const expenses = await prisma.monthlyExpense.findMany({
      where: {
        OR: Array.from({ length: 6 }).map((_, i) => {
          const d = subMonths(now, i);
          return { month: d.getMonth() + 1, year: d.getFullYear() };
        })
      }
    });

    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const start = startOfMonth(targetDate);
      const end = endOfMonth(targetDate);

      const stats = await prisma.salesTransaction.aggregate({
        where: {
          saleDate: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          totalRevenue: true,
          grossProfit: true,
        },
      });

      const monthExp = expenses.find(e => e.month === targetDate.getMonth() + 1 && e.year === targetDate.getFullYear());
      const mOpCost = monthExp?.amount || 0;
      const netProfit = Math.max(0, (stats._sum.grossProfit || 0) - mOpCost);

      trend.push({
        month: format(targetDate, "MMM"),
        revenue: stats._sum.totalRevenue || 0,
        profit: netProfit, // Use Net Profit for trend
        grossProfit: stats._sum.grossProfit || 0,
      });
    }

    // 3. Get profit sharing settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["investor_share", "manager_share"] } }
    });
    const investorRate = parseFloat(settings.find(s => s.key === "investor_share")?.value || "60") / 100;

    return NextResponse.json({
      summary: {
        revenue: currentMonthStats._sum.totalRevenue || 0,
        profit: currentNetProfit, // Show Net Profit on dashboard
        grossProfit: currentMonthStats._sum.grossProfit || 0,
        opCost,
        cogs: currentMonthStats._sum.totalHpp || 0,
        margin: currentMonthStats._sum.totalRevenue 
          ? (currentNetProfit / currentMonthStats._sum.totalRevenue) * 100 
          : 0,
        investorShare: currentNetProfit * investorRate,
      },
      trend,
    });
  } catch (error) {
    console.error("Finance summary error:", error);
    return NextResponse.json({ error: "Gagal memuat ringkasan keuangan" }, { status: 500 });
  }
}
