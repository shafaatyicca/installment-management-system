import mongoose, { Schema, model, models } from "mongoose";

const InvoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer select karna lazmi hai"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product select karna lazmi hai"],
    },
    // Yeh woh price hai jo aap customer ko is deal mein bech rahe hain (Profit daal kar)
    salePrice: {
      type: Number,
      required: [true, "Sale Price lazmi hai"],
      min: [0, "Sale price 0 se kam nahi ho sakti"],
    },
    downPayment: {
      type: Number,
      required: [true, "Down Payment lazmi hai"],
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    durationMonths: {
      type: Number,
      required: [true, "Duration (Months) lazmi hain"],
      min: [1, "Duration kam se kam 1 mahina honi chahiye"],
    },
    monthlyInstallment: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Defaulted"],
      default: "Active",
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

if (models.Invoice) {
  delete models.Invoice;
}

const Invoice = model("Invoice", InvoiceSchema);
export default Invoice;