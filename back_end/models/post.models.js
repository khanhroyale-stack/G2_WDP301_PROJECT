import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  images: [
    {
      type: String
    }
  ],
  category: {
    type: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  tags: [
    {
      type: String
    }
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"],
    default: "pending"
  },
  condition: {
    type: String,
    enum: ["newLike", "good", "fair"],
    default: "good",
  },
  brand: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "",
  },
  locationCity: {
    type: String,
    default: "",
  },
  locationDistrict: {
    type: String,
    default: "",
  },
  shippingType: {
    type: String,
    enum: ["pickup", "delivery", "both"],
    default: "both",
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFreeShip: {
    type: Boolean,
    default: false,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  favoriteCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  rejectReason: {
    type: String,
    default: ""
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  soldAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

export default mongoose.model("Post", postSchema);
