import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
    },
    donorName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional if guest donations are unauthenticated
    }
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
