import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

void Customer;
void Product;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const invoices = await Invoice.find({});

    let totalSaleValue = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let totalAdvanceCollected = 0;
    let totalInstallmentCollected = 0;
    let collectedCount = 0;

    const from = fromDate ? new Date(fromDate) : null;
    if (from) from.setHours(0, 0, 0, 0);

    const to = toDate ? new Date(toDate) : null;
    if (to) to.setHours(23, 59, 59, 999);

    invoices.forEach((inv: any) => {
      totalSaleValue += inv.salePrice || 0;

      inv.installments?.forEach((inst: any) => {
        const dueDate = new Date(inst.dueDate);

        // 🔥 DUE CALCULATION: Agar koi "to" date diya hai to sirf usi tareekh tak
        // ki kisten count karein jo abhi tak unpaid hain.
        // Agar koi date filter nahi hai, to current overall dueAmount style behaviour
        // (yani saari unpaid kisten, chahe future ki ho) follow karein.
        if (inst.status !== "Paid") {
          if (to) {
            if (dueDate <= to) {
              totalDue += inst.amount || 0;
            }
          } else {
            totalDue += inst.amount || 0;
          }
        }

        // COLLECTION CALCULATION: Sirf paid installments, paidDate ke range ke andar
        if (inst.status === "Paid" && inst.paidDate) {
          const paidDate = new Date(inst.paidDate);

          if (from && paidDate < from) return;
          if (to && paidDate > to) return;

          totalCollected += inst.amountPaid || 0;
          collectedCount += 1;

          if (inst.installNo === 0) {
            totalAdvanceCollected += inst.amountPaid || 0;
          } else {
            totalInstallmentCollected += inst.amountPaid || 0;
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSaleValue,
        totalDue,
        totalCollected,
        totalAdvanceCollected,
        totalInstallmentCollected,
        collectedCount,
        filterApplied: !!(from || to),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}