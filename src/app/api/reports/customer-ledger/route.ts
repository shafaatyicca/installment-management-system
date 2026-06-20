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
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID lazmi hai" },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer nahi mila" },
        { status: 404 }
      );
    }

    const invoices = await Invoice.find({ customer: customerId })
      .populate("products.product")
      .sort({ createdAt: -1 });

    // Summary totals calculate karein
    let totalSaleValue = 0;
    let totalPaid = 0;
    let totalDue = 0;

    invoices.forEach((inv: any) => {
      totalSaleValue += inv.salePrice || 0;
      totalDue += inv.dueAmount || 0;

      inv.installments?.forEach((inst: any) => {
        if (inst.status === "Paid") {
          totalPaid += inst.amountPaid || 0;
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        customer,
        invoices,
        summary: {
          totalInvoices: invoices.length,
          totalSaleValue,
          totalPaid,
          totalDue,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}