import mongoose from "mongoose";

const shipperProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ["motorbike", "car", "bicycle", "other"],
      default: "motorbike",
    },
    licensePlate: {
      type: String,
      default: "",
    },
    serviceAreas: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    currentOrderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ShipperProfile", shipperProfileSchema);