import mongoose from "mongoose";

const shipmentEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "picked_up", "in_transit", "delivered", "failed", "cancelled"],
      default: "assigned",
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    pickupAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    proofImages: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      default: "",
    },
    timeline: {
      type: [shipmentEventSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Shipment", shipmentSchema);