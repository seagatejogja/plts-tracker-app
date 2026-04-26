import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (month && year) {
      const expense = await prisma.monthlyExpense.findUnique({
        where: {
          month_year: { month, year },
        },
      });
      return NextResponse.json(expense || { amount: 0, notes: "" });
    }

    const expenses = await prisma.monthlyExpense.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json({ error: "Gagal mengambil data biaya" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year, amount, notes, createdBy } = body;

    const expense = await prisma.monthlyExpense.upsert({
      where: {
        month_year: { month, year },
      },
      update: {
        amount: parseFloat(amount),
        notes,
        createdBy,
      },
      create: {
        month,
        year,
        amount: parseFloat(amount),
        notes,
        createdBy,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to save expense:", error);
    return NextResponse.json({ error: "Gagal menyimpan data biaya" }, { status: 500 });
  }
}
