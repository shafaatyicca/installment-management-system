import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product ka naam lazmi hai"],
      trim: true,
    },
    costPrice: {
      type: Number,
      required: [true, "Khareed Qeemat (Cost Price) lazmi hai"],
      min: [0, "Qeemat 0 se kam nahi ho sakti"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity lazmi hai"],
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0, // Isme (costPrice * stock) auto save hoga
    },
    brand: {
      type: String,
      default: "", // Optional
      trim: true,
    },
    modelNumber: {
      type: String,
      default: "", // Optional
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;