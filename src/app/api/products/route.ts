import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json({ success: false, message: "Product nahi mila" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }

    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 🔥 100% FIXED POST METHOD (API LEVEL CALCULATION)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Explicitly Numbers mein convert kar rahe hain taake calculation mein 0 ya NaN na aaye
    const costPrice = Number(body.costPrice || 0);
    const stock = Number(body.stock || 0);
    const totalCost = costPrice * stock; // <--- API Level Multiplication

    const newProduct = await Product.create({
      name: body.name,
      costPrice: costPrice,
      stock: stock,
      totalCost: totalCost, // Ab DB mein bilkul sahi calculation jayegi
      brand: body.brand || "",
      modelNumber: body.modelNumber || "",
    });

    return NextResponse.json({ success: true, message: "Product stock mein add ho gaya!", data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 🔥 100% FIXED PUT METHOD (API LEVEL CALCULATION FOR EDIT)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID lazmi hai" }, { status: 400 });
    }

    const body = await request.json();
    
    // Pehle purana product nikalte hain taake agar koi field edit na ho rahi ho, to purani value use ho sake
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product nahi mila" }, { status: 404 });
    }

    // Agar user ne new cost ya stock bheja hai to woh use hoga, nahi to purana wala
    const finalCostPrice = body.costPrice !== undefined ? Number(body.costPrice) : existingProduct.costPrice;
    const finalStock = body.stock !== undefined ? Number(body.stock) : existingProduct.stock;
    const finalTotalCost = finalCostPrice * finalStock; // <--- API Level Multiplication for Edit

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        $set: {
          name: body.name,
          costPrice: finalCostPrice,
          stock: finalStock,
          totalCost: finalTotalCost,
          brand: body.brand,
          modelNumber: body.modelNumber
        } 
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, message: "Product update ho gaya!", data: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID lazmi hai" }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: "Product nahi mila" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product stock se delete ho gaya! 🗑️" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}