import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // 🎯 FIX: Sirf active nahi, balki sari invoices uthayein taake cash sales bhi count hon
    const [totalCustomers, totalProducts, allInvoices] = await Promise.all([
      Customer.countDocuments(),
      Product.countDocuments(),
      Invoice.find({}), // 🔥 Empty object matlab sari invoices (Active, Completed, etc.)
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let totalReceivable = 0;
    let totalReceived = 0;
    let overdueAmount = 0;
    let todayDue = 0;
    let activeInstallmentsCount = 0; // 🔥 Active accounts ka count alag se calculate karenge
    const dueCustomersSet = new Set<string>();

   allInvoices.forEach((invoice: any) => {
      // Main Invoice status check (Case-insensitive)
      const invStatus = invoice.status || "";

      if (invStatus === "Active") {
        activeInstallmentsCount++;
      }

      if (invoice.installments && Array.isArray(invoice.installments)) {
        invoice.installments.forEach((inst: any) => {
          const dueDate = new Date(inst.dueDate);
          
          // Mongoose ObjectId ko safe string mein convert kiya
          const custId = invoice.customer ? invoice.customer.toString() : null;
          const instStatus = inst.status; // "Pending", "Paid", "Overdue"

          // 🎯 1. Total Received (Chahe invoice active ho ya defaulted, paid amount yahan shamil hogi)
          if (instStatus === "Paid") {
            totalReceived += inst.amountPaid || inst.amount || 0;
          } 
          // 🎯 2. Total Receivable (Sirf un kiston ka udhaar jo completed nahi hain aur paid nahi hain)
          else if (invStatus !== "Completed") {
            totalReceivable += inst.amount || 0;
          }

          // 📊 Overdue aur Today Due ki safe calculations (Sirf tab chalengi jab account completed na ho)
          if (invStatus !== "Completed") {
            
            const isKistUnpaid = instStatus !== "Paid";
            const isPastDue = isKistUnpaid && dueDate < todayStart;
            const currentAmount = Number(inst.amount || 0); // Safe numeric convert

            // 🎯 Check A: Overdue tabhi count ho jab amount 0 se badi ho aur date guzar chuki ho
            if (currentAmount > 0 && (instStatus === "Overdue" || isPastDue)) {
              overdueAmount += currentAmount;
              if (isKistUnpaid && custId) {
                dueCustomersSet.add(custId);
              }
            } 
            // 🎯 Check B: Today Due bhi tabhi count ho jab amount 0 se badi ho aur aaj ki date pending ho
            else if (currentAmount > 0 && instStatus === "Pending") {
              if (dueDate >= todayStart && dueDate <= todayEnd) {
                todayDue += currentAmount;
                if (isKistUnpaid && custId) {
                  dueCustomersSet.add(custId);
                }
              }
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        activeInstallments: activeInstallmentsCount, // 🔥 Active accounts count
        totalReceivable,
        overdueAmount,
        totalDueCustomers: dueCustomersSet.size,
        todayDue,
        totalReceived, // 🔥 Ab isme Cash Sales aur Installments dono shamil hain!
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}