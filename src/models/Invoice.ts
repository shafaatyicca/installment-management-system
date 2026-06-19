import mongoose, { Schema, model, models } from "mongoose";

// 1. HAR EK KIST KA APNA ALAG SCHEMA
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
    type: Number, // Scheduled kist ki fix amount
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue"], // Kist ka status sirf "Paid" ya "Pending" hoga
    default: "Pending",
  },
  paidDate: {
    type: Date,
    default: null,
  },
  receiptNumber: {
    type: String, // Unique raseed number (REC-123456)
    default: null,
  },
  amountPaid: {
    type: Number, // Asal mian kitne paise received huwe
    default: 0,
  },
  // 🔥 FIELD 1: Puraani receipts print karne ke liye us specific month ka historical balance track karega
  remainingAfterThis: {
    type: Number,
    default: 0,
  }
});

// 2. CART KE PRODUCTS KA SCHEMA
const InvoiceProductSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID lazmi hai"],
  },
  name: {
    type: String, 
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

// 3. MAIN INVOICE / DEAL KA MAIN SCHEMA
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
      default: 0, // Yeh poori deal ka ORIGINAL static balance track karega
    },
    // 🔥 FIELD 2: Live current udhaar track karega jo payments ke sath kam hoga (Table/Modal crash issue fix)
    dueAmount: {
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
    // Yeh poori deal ka status hai
    status: {
      type: String,
      enum: ["Active", "Completed", "Defaulted"],
      default: "Active",
    },
    installments: [InstallmentScheduleSchema], // Kisto ki list yahan map hoti hai
    
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🟢 NEXT.JS RELOADING CRASH FIX: Model ko check karne aur export karne ka sahi tareeqa
const Invoice = models.Invoice || model("Invoice", InvoiceSchema);
export default Invoice;