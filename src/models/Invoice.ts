import mongoose, { Schema, model, models } from "mongoose";

const InstallmentScheduleSchema = new Schema({
  installNo: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue"],
    default: "Pending",
  },
  paidDate: {
    type: Date,
    default: null,
  },
});

// 🔥 Naya Sub-Schema Multiple Products ke cart ke liye
const InvoiceProductSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID lazmi hai"],
  },
  name: {
    type: String, // Dynamic reference loss na ho isliye safe-side name backup rakh rahe hain
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity kam az kam 1 honi chahiye"],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price 0 se kam nahi ho sakti"],
  }
});

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
    products: {
      type: [InvoiceProductSchema],
      validate: {
        validator: function (v: any[]) {
          return v && v.length > 0;
        },
        message: "Kam az kam ek product select karna lazmi hai",
      },
    },

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
      default: 0,
    },
    monthlyInstallment: {
      type: Number,
      required: true,
      default: 0,
    },
    saleType: {
      type: String,
      enum: ["Cash", "Installment"],
      default: "Installment",
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Defaulted"],
      default: "Active",
    },
    installments: [InstallmentScheduleSchema],
    
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