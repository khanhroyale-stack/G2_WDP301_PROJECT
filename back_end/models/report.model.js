import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reportType: {
      type: String,
      enum: ["spam", "fake", "prohibited", "scam", "other"],
      default: "other",
    },
    details: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNote: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionAction: {
      type: String,
      enum: ["none", "hidden", "warning", "banSeller", "dismissed"],
      default: "none",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
