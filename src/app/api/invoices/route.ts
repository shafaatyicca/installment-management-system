import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 1. GET METHOD: Saari invoices ya single invoice nikalne ke liye (With Customer & Product details populated)
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const invoice = await Invoice.findById(id).populate("customer").populate("product");
      if (!invoice) {
        return NextResponse.json({ success: false, message: "Invoice nahi mili" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: invoice });
    }

    const invoices = await Invoice.find({})
      .populate("customer")
      .populate("product")
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST METHOD: Invoice generate karna + Stock auto-manage karna
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerId, productId, salePrice, downPayment, durationMonths } = body;

    if (!customerId || !productId || !salePrice || !durationMonths) {
      return NextResponse.json({ success: false, message: "Tamam fields lazmi hain." }, { status: 400 });
    }

    // Check karein ke product stock mein hai ya nahi
    const product = await Product.findById(productId);
    if (!product || product.stock < 1) {
      return NextResponse.json({ success: false, message: "Product stock mein maujood nahi hai!" }, { status: 400 });
    }

    // 🔥 AUTOMATIC CALCULATION LOGIC (As per your formula)
    const sPrice = Number(salePrice);
    const dPayment = Number(downPayment || 0);
    const months = Number(durationMonths);

    const remaining = sPrice - dPayment; // e.g., 100,000 - 20,000 = 80,000
    const installment = Math.round(remaining / months); // e.g., 80,000 / 10 = 8,000

    // Unique Invoice Number Generate karein (e.g., INV-1718292)
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Invoice create karein
    const newInvoice = await Invoice.create({
      invoiceNumber,
      customer: customerId,
      product: productId,
      salePrice: sPrice,
      downPayment: dPayment,
      remainingAmount: remaining,
      durationMonths: months,
      monthlyInstallment: installment,
    });

    // 📦 Stock Management: Product ka stock 1 kam kar dein
    product.stock = product.stock - 1;
    // totalCost ko bhi new stock ke mutabiq sync karein
    product.totalCost = product.costPrice * product.stock;
    await product.save();

    return NextResponse.json({ 
      success: true, 
      message: "Invoice successfully generate ho gayi aur stock update ho gaya! 📄", 
      data: newInvoice 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}