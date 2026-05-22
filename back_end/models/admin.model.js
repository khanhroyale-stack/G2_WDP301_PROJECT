import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: ["manage_users", "manage_posts", "manage_orders", "manage_reports"],
    },
    department: {
      type: String,
      default: "operations",
    },
    note: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAssignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AdminProfile", adminProfileSchema);