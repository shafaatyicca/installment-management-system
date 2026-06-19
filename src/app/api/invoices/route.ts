import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Invoice from "@/models/Invoice";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

void Customer;
void Product;

export const dynamic = "force-dynamic";

// Helper 1: Number ko 3-digit format (001, 002) mein convert karne ke liye
function formatToThreeDigits(num: number): string {
  return num.toString().padStart(3, '0');
}

// 🔥 Helper 2: Puraay DB se fresh aur highest Receipt Number nikalne ka single solution
async function getLatestReceiptNumber(): Promise<number> {
  const allInvoices = await Invoice.find({});
  let highestReceiptNum = 0;
  
  allInvoices.forEach((inv) => {
    if (inv.installments && Array.isArray(inv.installments)) {
      inv.installments.forEach((inst: any) => {
        if (inst.receiptNumber && inst.receiptNumber.startsWith("REC-")) {
          const rNum = parseInt(inst.receiptNumber.replace("REC-", ""), 10);
          if (!isNaN(rNum) && rNum > highestReceiptNum) {
            highestReceiptNum = rNum;
          }
        }
      });
    }
  });
  
  return highestReceiptNum + 1;
}

// 1. GET METHOD: Saari invoices ya single invoice load karne ke liye
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

// 2. POST METHOD: Multi-Product Invoice Create Engine
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

    // Stock verification Aur AUTOMATIC NAME FIX
    for (const item of products) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return NextResponse.json({ success: false, message: `Product database mein nahi mila!` }, { status: 404 });
      }
      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `"${item.name || dbProduct.name}" ka stock kam hai! Available: ${dbProduct.stock}` 
        }, { status: 400 });
      }

      item.name = dbProduct.name;
    }

    const sPrice = Number(salePrice || 0);
    const dPayment = isCashSale ? 0 : Number(downPayment || 0);
    const months = isCashSale ? 0 : Number(finalDurationMonths || 0);
    const remaining = isCashSale ? 0 : (sPrice - dPayment);
    const installment = isCashSale ? 0 : Number(finalMonthlyInstallment || 0);

    // SEQUENCE INVOICE NUMBER LOGIC
    const lastInvoice = await Invoice.findOne({}).sort({ createdAt: -1 });
    let nextInvoiceNumber = 1;

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.replace("INV-", ""), 10);
      if (!isNaN(lastNum)) {
        nextInvoiceNumber = lastNum + 1;
      }
    }

    // 🔥 Get fresh receipt number sequence from helper function
    let nextReceiptNumber = await getLatestReceiptNumber();

    const invoiceNumber = `INV-${formatToThreeDigits(nextInvoiceNumber)}`;
    const installmentSchedule = [];
    let advanceReceiptData = null;

    if (isCashSale) {
      const cashReceiptNo = `REC-${formatToThreeDigits(nextReceiptNumber)}`;
      
      installmentSchedule.push({
        installNo: 1,
        dueDate: new Date(),
        amount: sPrice,
        status: "Paid",
        paidDate: new Date(),
        receiptNumber: cashReceiptNo,
        amountPaid: sPrice,
        remainingAfterThis: 0,
      });

      advanceReceiptData = {
        receiptNumber: cashReceiptNo,
        amountReceived: sPrice,
        remainingBalance: 0,
        paidDate: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        isAdvance: false,
      };

    } else {
      const hasDownPayment = dPayment > 0;
      let advReceiptNo = null;
      
      if (hasDownPayment) {
        advReceiptNo = `REC-${formatToThreeDigits(nextReceiptNumber)}`;
      }

      installmentSchedule.push({
        installNo: 0, 
        dueDate: new Date(),
        amount: dPayment,
        status: hasDownPayment ? "Paid" : "Pending",
        paidDate: hasDownPayment ? new Date() : null,
        receiptNumber: advReceiptNo,
        amountPaid: hasDownPayment ? dPayment : 0,
        remainingAfterThis: remaining,
      });

      if (hasDownPayment) {
        advanceReceiptData = {
          receiptNumber: advReceiptNo,
          amountReceived: dPayment,
          remainingBalance: remaining,
          paidDate: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
          isAdvance: true,
        };
      }

      if (months > 0) {
        let accumulatedAmount = 0;
        let runningRemaining = remaining;

        for (let i = 1; i <= months; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);

          if (dueDate.getDate() < new Date().getDate()) {
            dueDate.setDate(0);
          }

          let currentKistAmount = 0;
          if (i === months) {
            currentKistAmount = remaining - accumulatedAmount;
          } else {
            currentKistAmount = installment;
            accumulatedAmount += installment;
          }

          runningRemaining = runningRemaining - currentKistAmount;

          installmentSchedule.push({
            installNo: i,
            dueDate: dueDate,
            amount: currentKistAmount,
            status: "Pending",
            paidDate: null,
            receiptNumber: null,
            amountPaid: 0,
            remainingAfterThis: Math.max(0, runningRemaining),
          });
        }
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
      dueAmount: remaining,       
      durationMonths: months,
      monthlyInstallment: installment,
      installments: installmentSchedule, 
      status: isCashSale ? "Completed" : "Active"
    };

    const newInvoice = await Invoice.create(invoicePayload);

    for (const item of products) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);
        const price = dbProduct.costPrice || 0;
        dbProduct.totalCost = price * dbProduct.stock;
        await dbProduct.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Invoice successfully generate ho gayi!", 
      advanceReceipt: advanceReceiptData, 
      data: newInvoice 
    }, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL BACKEND ERROR:", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: 500 });
  }
}

// 3. PUT METHOD: Kist (Installment) Pay Karne Ke Liye
export async function PUT(request: Request) {
  try {
    await connectDB();
    const { invoiceId, installmentId } = await request.json();

    if (!invoiceId || !installmentId) {
      return NextResponse.json(
        { success: false, message: "Invoice ID aur Installment ID zaroori hain!" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice record nahi mila." },
        { status: 404 }
      );
    }

    const targetInstallment = invoice.installments.id(installmentId);
    if (!targetInstallment) {
      return NextResponse.json(
        { success: false, message: "Kist ka specific data array mein nahi mila!" },
        { status: 404 }
      );
    }

    if (targetInstallment.status === "Paid") {
      return NextResponse.json(
        { success: false, message: "Yeh kist pehle se hi Paid hai!" },
        { status: 400 }
      );
    }

    const kistAmount = targetInstallment.amount;

    // 🔥 Call helper function directly instead of writing whole loop again
    const nextReceiptNumber = await getLatestReceiptNumber();
    const generatedReceiptNumber = `REC-${formatToThreeDigits(nextReceiptNumber)}`;

    // Update specific installment status
    targetInstallment.status = "Paid";
    targetInstallment.paidDate = new Date();
    targetInstallment.receiptNumber = generatedReceiptNumber;
    targetInstallment.amountPaid = kistAmount;

    // Fixed: remainingAmount static rahega, sirf live dueAmount minus hoga
    invoice.dueAmount = Math.max(0, invoice.dueAmount - kistAmount);

    // Check if all installments are paid
    const totalInstallments = invoice.installments.length;
    const paidInstallments = invoice.installments.filter(
      (inst: any) => inst.status === "Paid"
    ).length;

    if (totalInstallments === paidInstallments) {
      invoice.status = "Completed";
    }

    await invoice.save();

    return NextResponse.json({
      success: true,
      message: "Kist successfully jama ho gayi aur raseed taiyar hai!",
      receipt: {
        receiptNumber: generatedReceiptNumber,
        amountReceived: kistAmount,
        remainingBalance: invoice.dueAmount,
        paidDate: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
      },
      data: invoice,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}