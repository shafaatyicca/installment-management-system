import mongoose, { Schema, Document } from "mongoose";

// TypeScript Interface: Taake coding karte waqt autocomplete/types ka maza aaye
export interface ICustomer extends Document {
  name: string;
  cnic: string;
  mobile: string;
  address: string;
  guarantorName?: string;
  guarantorMobile?: string;
  guarantorCnic?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      unique: true, // Ek CNIC par do accounts nahi banne chahiye
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    // Guarantor fields (Optional rakh rahe hain, zaroori nahi har customer le kar aaye)
    guarantorName: {
      type: String,
      trim: true,
    },
    guarantorMobile: {
      type: String,
      trim: true,
    },
    guarantorCnic: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Yeh automatically 'createdAt' aur 'updatedAt' bana dega
  }
);

// Next.js hot reloading mein model dubara compile hone se bachane ke liye check
const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;