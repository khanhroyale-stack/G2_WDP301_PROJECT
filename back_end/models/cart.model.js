import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    priceAtAdd: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
