import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

export async function PUT(request: Request) {
  try {
    // 1. Database se connect karein
    await connectDB();

    // 2. Request body se IDs nikalein
    const { invoiceId, installmentId } = await request.json();

    if (!invoiceId || !installmentId) {
      return NextResponse.json(
        { success: false, message: "Invoice ID aur Installment ID zaroori hain!" },
        { status: 400 }
      );
    }

    // 3. Invoice dhoond kar array ke andar specific installment ko update karein
    const updatedInvoice = await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,
        "installments._id": installmentId,
      },
      {
        $set: {
          "installments.$.status": "Paid",
          "installments.$.paidDate": new Date(), // Aaj ki vasooli ki tareekh
        },
      },
      { new: true } // Updated document return karein
    );

    if (!updatedInvoice) {
      return NextResponse.json(
        { success: false, message: "Record nahi mila ya data galat hai." },
        { status: 404 }
      );
    }

    // 4. [Bonus Logic] Agar saari kistein Paid ho chuki hain, to poori Invoice ko "Completed" kar dein
    const totalInstallments = updatedInvoice.installments.length;
    const paidInstallments = updatedInvoice.installments.filter(
      (inst: any) => inst.status === "Paid"
    ).length;

    if (totalInstallments === paidInstallments) {
      updatedInvoice.status = "Completed";
      await updatedInvoice.save();
    }

    // 5. Success response bhejein
    return NextResponse.json({
      success: true,
      message: "Kist successfully jama ho gayi!",
      data: updatedInvoice,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}