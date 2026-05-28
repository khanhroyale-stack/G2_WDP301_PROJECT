import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";

const orderPopulate = [
  { path: "buyerId", select: "username full_name phone" },
  { path: "shippingAddressId" },
  { path: "items.postId", select: "title images price status" },
  { path: "shipperId", select: "username full_name" },
];

export const getShipperOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ["confirmed", "shipping"] },
      $or: [{ shipperId: null }, { shipperId: req.user.id }],
    })
      .populate(orderPopulate)
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignShipper = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.shipperId) {
      return res.status(400).json({ message: "Đơn hàng đã được gán shipper" });
    }

    if (order.orderStatus !== "confirmed") {
      return res.status(400).json({ message: "Đơn hàng chưa ở trạng thái sẵn sàng giao" });
    }

    order.shipperId = req.user.id;
    order.orderStatus = "shipping";
    order.inspectionStatus = "pending";
    await order.save();

    const populated = await Order.findById(order._id).populate(orderPopulate);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitInspection = async (req, res) => {
  try {
    const { decision, note = "" } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (!order.shipperId || String(order.shipperId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Bạn không được xử lý đơn này" });
    }

    if (order.orderStatus !== "shipping") {
      return res.status(400).json({ message: "Đơn hàng chưa ở trạng thái giao" });
    }

    order.inspectionStatus = decision;
    order.inspectionNote = note;
    order.inspectedAt = new Date();

    if (decision === "approved") {
      order.orderStatus = "completed";
      order.paymentStatus = "paid";
      await Transaction.updateMany({ orderId: order._id }, { status: "paid" });
    } else {
      order.orderStatus = "cancelled";
      order.paymentStatus = "refunded";
      await Transaction.updateMany(
        { orderId: order._id },
        { status: "refunded", failReason: "Hàng không đạt kiểm định" }
      );
    }

    await order.save();

    const populated = await Order.findById(order._id).populate(orderPopulate);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
