import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";

// 1. GET METHOD: Saare customers ya kisi 1 customer ko fetch karne ke liye
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Agar URL mein `?id=...` bheja hai, to sirf us 1 customer ka data do (Profile ke liye)
    if (id) {
      const customer = await Customer.findById(id);
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer nahi mila" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: customer });
    }

    // Agar ID nahi bheji, to saare customers la kar do (Table ke liye)
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: customers });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST METHOD: Naya Customer Add karne ke liye
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, cnic, mobile, address, guarantorName, guarantorMobile, guarantorCnic } = body;

    if (!name || !cnic || !mobile || !address) {
      return NextResponse.json({ success: false, message: "Zaroori fields lazmi hain." }, { status: 400 });
    }

    const existingCustomer = await Customer.findOne({ cnic });
    if (existingCustomer) {
      return NextResponse.json({ success: false, message: "Is CNIC ka customer pehle se maujood hai." }, { status: 400 });
    }

    const newCustomer = await Customer.create({
      name, cnic, mobile, address, guarantorName, guarantorMobile, guarantorCnic
    });

    return NextResponse.json({ success: true, message: "Customer add ho gaya!", data: newCustomer }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. PUT METHOD: Purane Customer ka data Edit/Update karne ke liye
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Customer ID lazmi hai" }, { status: 400 });
    }

    const body = await request.json();

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json({ success: false, message: "Customer nahi mila" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer update ho gaya!", data: updatedCustomer });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 4. DELETE METHOD: Customer delete karne ke liye
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Customer ID lazmi hai" }, { status: 400 });
    }

    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return NextResponse.json({ success: false, message: "Customer nahi mila" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer successfully delete ho gaya! 🗑️" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}