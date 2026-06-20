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
      .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueList: any[] = [];

    invoices.forEach((inv: any) => {
      inv.installments?.forEach((inst: any) => {
        if (inst.status !== "Pending") return;

        const dueDate = new Date(inst.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // Sirf wahi kisten jo aaj se pehle (overdue) ya aaj (today's due) hain
        if (dueDate >= tomorrow) return;

        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        dueList.push({
          customerId: inv.customer?._id || null,
          customerName: inv.customer?.name || "Deleted Customer",
          customerMobile: inv.customer?.mobile || "-",
          invoiceNumber: inv.invoiceNumber,
          invoiceId: inv._id,
          installNo: inst.installNo,
          dueDate: inst.dueDate,
          amount: inst.amount,
          daysLate: diffDays > 0 ? diffDays : 0,
          isToday: diffDays === 0,
          isOverdue: diffDays > 0,
        });
      });
    });

    // Sabse zyada late wali kisten upar dikhayein
    dueList.sort((a, b) => b.daysLate - a.daysLate);

    const totalOverdueAmount = dueList
      .filter((d) => d.isOverdue)
      .reduce((acc, d) => acc + d.amount, 0);

    const totalTodayAmount = dueList
      .filter((d) => d.isToday)
      .reduce((acc, d) => acc + d.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        list: dueList,
        summary: {
          totalOverdueAmount,
          totalTodayAmount,
          totalOverdueCount: dueList.filter((d) => d.isOverdue).length,
          totalTodayCount: dueList.filter((d) => d.isToday).length,
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