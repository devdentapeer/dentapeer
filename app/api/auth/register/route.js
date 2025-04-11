import { NextResponse } from "next/server";

import User from "@/models/User"; // You'll need to create this model
import dbConnect from "@/libs/mongoose";


export async function POST(request) {
  try {
    const { email, password, fullName, role, address, city, phone } =
      await request.json();
    console.log(email, password, fullName, role, address, city, phone);

    // Validate input
    if (
      !email ||
      !password ||
      !fullName ||
      !role ||
      !address ||
      !city ||
      !phone
    ) {
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı zaten kayıtlı" },
        { status: 409 }
      );
    }

    // Hash password

    // Create new user
    const user = await User.create({
      email,
      password,
      fullName,
      role,
      address,
      city,
      phone,
    });

    // Return success without exposing sensitive data
    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla kayıt edildi",
        user: user.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Bir şeyler ters gitti" },
      { status: 500 }
    );
  }
}

