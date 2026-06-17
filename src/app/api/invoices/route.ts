import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 1. GET METHOD: Saari invoices ya single invoice nikalne ke liye
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const _c = Customer.modelName; 
    const _p = Product.modelName;

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
    return NextResponse.json({ success: false, error: error.message || "Vercel Populate Error" }, { status: 500 });
  }
}

// 2. POST METHOD: Invoice generate karna + Stock auto-manage + 🗓️ INSTALLMENT SCHEDULE GENERATE
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

    // AUTOMATIC CALCULATION LOGIC
    const sPrice = Number(salePrice);
    const dPayment = Number(downPayment || 0);
    const months = Number(durationMonths);

    const remaining = sPrice - dPayment; 
    const installment = Math.round(remaining / months); 

    // Unique Invoice Number
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // 🗓️ MODULE 4: SCHEDULE GENERATION LOGIC START
    const installmentSchedule = [];
    const currentDate = new Date(); // Aaj ki date se schedule shuru hoga

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date();
      // Har cycle mein 1 mahina agay barhein (Month 1, Month 2...)
      dueDate.setMonth(currentDate.getMonth() + i);

      // Handle Month Overflow (Agar aaj 31st hai aur agle mahine 30 din hain to crash na ho)
      if (dueDate.getDate() !== currentDate.getDate()) {
        dueDate.setDate(0); 
      }

      installmentSchedule.push({
        installNo: i,
        dueDate: dueDate,
        amount: installment,
        status: "Pending", // Default status sub kistoo ka pending hoga
        paidDate: null
      });
    }
    // 🗓️ SCHEDULE GENERATION LOGIC END

    // Invoice create karein (With Installments Array)
    const newInvoice = await Invoice.create({
      invoiceNumber,
      customer: customerId,
      product: productId,
      salePrice: sPrice,
      downPayment: dPayment,
      remainingAmount: remaining,
      durationMonths: months,
      monthlyInstallment: installment,
      installments: installmentSchedule, // 🔥 Database schema mein save ho raha hai
    });

    // 📦 Stock Management: Product ka stock 1 kam kar dein
    product.stock = product.stock - 1;
    product.totalCost = product.costPrice * product.stock;
    await product.save();

    return NextResponse.json({ 
      success: true, 
      message: "Invoice successfully generate ho gayi, stock kam ho gaya aur installment schedule ban gaya! 📄🗓️", 
      data: newInvoice 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}