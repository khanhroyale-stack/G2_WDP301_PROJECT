import User from "../models/user.models.js";
import Post from "../models/post.models.js";
import Report from "../models/report.model.js";
import Transaction from "../models/transaction.model.js";
import Order from "../models/order.model.js";
import Shipment from "../models/shipment.model.js";
import { randomUUID } from "crypto";

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalPosts,
      pendingPosts,
      approvedPosts,
      soldPosts,
      pendingReports,
      totalReports,
      transactionStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "banned" }),
      Post.countDocuments(),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "approved" }),
      Post.countDocuments({ status: "sold" }),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments(),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalCommission: { $sum: "$commissionAmount" },
            totalTransactions: { $sum: 1 },
          },
        },
      ]),
    ]);

    const tx = transactionStats[0] || {
      totalRevenue: 0,
      totalCommission: 0,
      totalTransactions: 0,
    };

    res.json({
      users: { totalUsers, activeUsers, bannedUsers },
      posts: { totalPosts, pendingPosts, approvedPosts, soldPosts },
      reports: { totalReports, pendingReports },
      transactions: tx,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsersForAdmin = async (req, res) => {
  try {
    const { status, role, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { full_name: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "banned", "unverified"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildShipmentTrackingCode = () => {
  return `SHP-${randomUUID().slice(0, 8).toUpperCase()}`;
};

export const getShipmentsForAdmin = async (req, res) => {
  try {
    const { status, shipperId, orderId, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (shipperId) query.shipperId = shipperId;
    if (orderId) query.orderId = orderId;
    if (search) query.trackingCode = { $regex: search, $options: "i" };

    const shipments = await Shipment.find(query)
      .populate("shipperId", "username full_name email phone role status")
      .populate({
        path: "orderId",
        select: "buyerId totalAmount orderStatus paymentStatus note createdAt updatedAt shippingAddressId",
        populate: [
          { path: "buyerId", select: "username full_name phone email" },
          { path: "shippingAddressId" },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignShipperToOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { shipperId, deliveryFee = 0, note = "" } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (["cancelled", "completed"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Đơn hàng đã hoàn tất hoặc bị hủy nên không thể phân công" });
    }

    const shipper = await User.findOne({ _id: shipperId, role: "shipper" });
    if (!shipper) {
      return res.status(404).json({ message: "Không tìm thấy shipper hợp lệ" });
    }

    let shipment = await Shipment.findOne({ orderId });
    const timelineEntry = {
      status: shipment ? shipment.status : "assigned",
      note: note || "Phân công shipper",
      updatedBy: req.user.id,
      at: new Date(),
    };

    if (!shipment) {
      shipment = await Shipment.create({
        orderId,
        shipperId,
        assignedBy: req.user.id,
        trackingCode: buildShipmentTrackingCode(),
        status: "assigned",
        deliveryFee,
        note,
        timeline: [timelineEntry],
      });
    } else {
      shipment.shipperId = shipperId;
      shipment.assignedBy = req.user.id;
      shipment.deliveryFee = deliveryFee;
      shipment.note = note;
      shipment.status = "assigned";
      shipment.timeline = [...(shipment.timeline || []), timelineEntry];
      shipment = await shipment.save();
    }

    order.orderStatus = "shipping";
    await order.save();

    const populatedShipment = await Shipment.findById(shipment._id)
      .populate("shipperId", "username full_name email phone role status")
      .populate({
        path: "orderId",
        select: "buyerId totalAmount orderStatus paymentStatus note createdAt updatedAt shippingAddressId",
        populate: [
          { path: "buyerId", select: "username full_name phone email" },
          { path: "shippingAddressId" },
        ],
      });

    res.status(201).json({ message: "Đã phân công shipper", shipment: populatedShipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = "", proofImages = [] } = req.body;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Không tìm thấy shipment" });
    }

    shipment.status = status;
    shipment.note = note || shipment.note;
    if (Array.isArray(proofImages) && proofImages.length > 0) {
      shipment.proofImages = proofImages;
    }

    const timelineEntry = {
      status,
      note: note || `Cập nhật trạng thái: ${status}`,
      updatedBy: req.user.id,
      at: new Date(),
    };
    shipment.timeline = [...(shipment.timeline || []), timelineEntry];

    const now = new Date();
    if (status === "picked_up") {
      shipment.pickupAt = shipment.pickupAt || now;
    }
    if (status === "delivered") {
      shipment.deliveredAt = now;
    }
    if (status === "failed") {
      shipment.failedAt = now;
    }

    await shipment.save();

    const order = await Order.findById(shipment.orderId);
    if (order) {
      if (["picked_up", "in_transit"].includes(status)) {
        order.orderStatus = "shipping";
      } else if (status === "delivered") {
        order.orderStatus = "completed";
        order.paymentStatus = order.paymentStatus === "failed" ? order.paymentStatus : "paid";
      } else if (status === "failed") {
        order.orderStatus = "confirmed";
      } else if (status === "cancelled") {
        order.orderStatus = "cancelled";
      }

      await order.save();
    }

    const populatedShipment = await Shipment.findById(shipment._id)
      .populate("shipperId", "username full_name email phone role status")
      .populate({
        path: "orderId",
        select: "buyerId totalAmount orderStatus paymentStatus note createdAt updatedAt shippingAddressId",
        populate: [
          { path: "buyerId", select: "username full_name phone email" },
          { path: "shippingAddressId" },
        ],
      });

    res.json({ message: "Đã cập nhật trạng thái shipment", shipment: populatedShipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
