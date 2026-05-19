import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String
  },
  highlightMessage: {
    type: String
  },
  goalAmount: {
    type: Number
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active"
  }
},
{ timestamps: true }
);

export default mongoose.model("Charity", charitySchema);