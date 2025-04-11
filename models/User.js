import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import toJSON from "./plugins/toJSON";
import { CITIES } from "@/libs/cities";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Lütfen tam adınızı giriniz"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Lütfen bir email adresi giriniz"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Lütfen geçerli bir email adresi giriniz",
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Lütfen bir şifre giriniz"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["laboratuvar", "diş_kliniği", "admin"],
    },
    address: {
      type: String,
      required: [true, "Lütfen bir adres giriniz"],
    },
    city: {
      required: [true, "Lütfen bir şehir giriniz"],
      type: String,
      enum: CITIES
    },
    phone: {
      type: String,
      required: [true, "Lütfen bir telefon numarası giriniz"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

userSchema.plugin(toJSON);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
