import mongoose, { Document, Schema , Types} from "mongoose";

export interface IBloodDonor extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  age: number;
  bloodGroup: "O+" | "O-" | "AB+" | "AB-" | "A+" | "A-" | "B+" | "B-";
  address: {
    place: string;
    pincode: number; // keep as number
  };
  lastDonationDate?: Date | null;
}

const bloodDonorSchema: Schema<IBloodDonor> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"], // Only 10 digits
    },
    age: {
      type: Number,
      required: true,
      min: [18, "You must be at least 18 years old to donate blood"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
    },
    address: {
      place: { type: String, required: true },
      pincode: { type: Number, required: true }, // corrected to Number
    },
    lastDonationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IBloodDonor>("BloodDonor", bloodDonorSchema);
