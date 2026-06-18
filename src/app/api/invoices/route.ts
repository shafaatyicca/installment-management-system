import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 1. GET METHOD: Saari invoices ya single invoice nikalne ke liye (With Array Populate)
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const _c = Customer.modelName; 
    const _p = Product.modelName;

    if (id) {
      const invoice = await Invoice.findById(id).populate("customer").populate("products.product");
      if (!invoice) {
        return NextResponse.json({ success: false, message: "Invoice nahi mili" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: invoice });
    }

    const invoices = await Invoice.find({})
      .populate("customer")
      .populate("products.product")
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Vercel Populate Error" }, { status: 500 });
  }
}

// 2. POST METHOD: Multi-Product Invoice Engine + Dynamic Stock Management
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { customerId, products, salePrice, downPayment, durationMonths: finalDurationMonths, monthlyInstallment: finalMonthlyInstallment, saleType } = body;

    const isCashSale = saleType === "Cash";

    if (!customerId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, message: "Customer aur kam az kam 1 Product select karna lazmi hai." }, { status: 400 });
    }

    if (!isCashSale && (!finalDurationMonths || Number(finalDurationMonths) <= 0)) {
      return NextResponse.json({ success: false, message: "Installment plan ke liye Months lazmi hain." }, { status: 400 });
    }

    let calculatedSalePrice = 0;

    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1 || !item.price) {
        return NextResponse.json({ success: false, message: "Product data complete nahi hai!" }, { status: 400 });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return NextResponse.json({ success: false, message: `Product database mein nahi mila!` }, { status: 404 });
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `"${item.name || dbProduct.name}" ka stock kam hai! Available stock: ${dbProduct.stock}` 
        }, { status: 400 });
      }
      calculatedSalePrice += Number(item.price) * Number(item.quantity);
    }

    const sPrice = Number(salePrice || 0);
    const dPayment = isCashSale ? 0 : Number(downPayment || 0);
    const months = isCashSale ? 0 : Number(finalDurationMonths || 0);
    const remaining = isCashSale ? 0 : (sPrice - dPayment);
    const installment = isCashSale ? 0 : Number(finalMonthlyInstallment || 0);

    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const installmentSchedule = [];

    if (isCashSale) {
      installmentSchedule.push({
        installNo: 1,
        dueDate: new Date(),
        amount: sPrice,
        status: "Pending",
        paidDate: null
      });
    } else if (months > 0) {
      const currentDate = new Date();
      // 🟢 FIXED: Pehle 1 se lekar last month tak bache huwe paise track karne ke liye variable
      let accumulatedAmount = 0;

      for (let i = 1; i <= months; i++) {
        const dueDate = new Date();
        dueDate.setMonth(currentDate.getMonth() + i);

        if (dueDate.getDate() !== currentDate.getDate()) {
          dueDate.setDate(0); 
        }

        let currentKistAmount = 0;

        // 🟢 FIXED: Agar aakhri mahina hai to mathematical formula se balance zero karenge
        if (i === months) {
          currentKistAmount = remaining - accumulatedAmount;
        } else {
          currentKistAmount = installment;
          accumulatedAmount += installment;
        }

        installmentSchedule.push({
          installNo: i,
          dueDate: dueDate,
          amount: currentKistAmount, // 🟢 FIXED: Adjusted amount push hoga
          status: "Pending",
          paidDate: null
        });
      }
    }

    const invoicePayload = {
      invoiceNumber,
      customer: customerId,
      products, 
      salePrice: sPrice,
      saleType: isCashSale ? "Cash" : "Installment", 
      downPayment: dPayment,
      remainingAmount: remaining,
      durationMonths: months,
      monthlyInstallment: installment,
      installments: installmentSchedule, 
      status: "Active"
    } as any;

    const newInvoice = await Invoice.create(invoicePayload);

    for (const item of products) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        dbProduct.stock = dbProduct.stock - item.quantity;
        dbProduct.totalCost = dbProduct.costPrice * dbProduct.stock;
        await dbProduct.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: isCashSale 
        ? "Cash Invoice successfully complete ho gayi aur stocks manage ho gaye!" 
        : "Installment Invoice successfully generate ho gayi aur multi-product inventory lock ho gayi!", 
      data: newInvoice 
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}