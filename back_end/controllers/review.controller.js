import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.models.js";

const recalcSellerRating = async (sellerId) => {
  const stats = await Review.aggregate([
    { $match: { sellerId } },
    {
      $group: {
        _id: "$sellerId",
        ratingAvg: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const stat = stats[0];
  await User.findByIdAndUpdate(sellerId, {
    ratingAvg: stat ? Number(stat.ratingAvg.toFixed(2)) : 0,
    ratingCount: stat ? stat.ratingCount : 0,
  });
};

export const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (String(order.buyerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Bạn không có quyền đánh giá đơn hàng này" });
    }

    if (order.orderStatus !== "completed") {
      return res.status(400).json({ message: "Chỉ được đánh giá sau khi đơn hàng hoàn tất" });
    }

    const sellerId = order.items?.[0]?.sellerId;
    if (!sellerId) {
      return res.status(400).json({ message: "Đơn hàng không hợp lệ để đánh giá" });
    }

    let review = await Review.findOne({ orderId, reviewerId: req.user.id });
    if (review) {
      review.rating = rating;
      review.comment = comment || "";
      await review.save();
    } else {
      review = await Review.create({
        orderId,
        reviewerId: req.user.id,
        sellerId,
        rating,
        comment: comment || "",
      });
    }

    await recalcSellerRating(sellerId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.find({ sellerId })
      .populate("reviewerId", "username full_name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user.id })
      .populate("sellerId", "username full_name")
      .populate("orderId", "totalAmount orderStatus")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
