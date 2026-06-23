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

    const invoices = await Invoice.find({})
      .populate("customer")
      .populate("products.product")
      .sort({ createdAt: -1 });

    const report: any[] = [];
    let totalSaleValue = 0;
    let totalCostValue = 0;
    let totalProfit = 0;

    invoices.forEach((inv: any) => {
      let invoiceCost = 0;

      inv.products?.forEach((item: any) => {
        // item.product ab populated Product document hai (ya null agar delete ho gaya ho)
        const costPrice = item.product?.costPrice || 0;
        invoiceCost += costPrice * item.quantity;
      });

      const profit = (inv.salePrice || 0) - invoiceCost;

      totalSaleValue += inv.salePrice || 0;
      totalCostValue += invoiceCost;
      totalProfit += profit;

      report.push({
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.name || "Deleted Customer",
        salePrice: inv.salePrice || 0,
        costPrice: invoiceCost,
        profit,
        status: inv.status,
        saleType: inv.saleType,
        createdAt: inv.createdAt,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        list: report,
        summary: {
          totalSaleValue,
          totalCostValue,
          totalProfit,
          totalInvoices: report.length,
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