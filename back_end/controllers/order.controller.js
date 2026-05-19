import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
import Post from "../models/post.models.js";
import Transaction from "../models/transaction.model.js";

const buildOrderItemsFromCart = (cartItems, userId) => {
  const validItems = [];

  for (const cartItem of cartItems) {
    const post = cartItem.postId;
    if (!post) continue;
    if (post.status !== "approved") continue;
    if (String(post.userId) === String(userId)) continue;

    const qty = Number(cartItem.quantity || 1);
    const unitPrice = Number(post.price || cartItem.priceAtAdd || 0);
    if (unitPrice <= 0 || qty <= 0) continue;

    validItems.push({
      postId: post._id,
      sellerId: post.userId,
      quantity: qty,
      unitPrice,
      subtotal: qty * unitPrice,
    });
  }

  return validItems;
};

export const checkoutFromCart = async (req, res) => {
  try {
    const { addressId, note = "", paymentMethod = "manual" } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.postId");
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng đang trống" });
    }

    let shippingAddress = null;
    if (addressId) {
      shippingAddress = await Address.findOne({ _id: addressId, userId: req.user.id });
    } else {
      shippingAddress = await Address.findOne({ userId: req.user.id, isDefault: true });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Cần thêm địa chỉ giao hàng trước khi đặt đơn" });
    }

    const items = buildOrderItemsFromCart(cart.items, req.user.id);
    if (items.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm hợp lệ để đặt đơn" });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      buyerId: req.user.id,
      items,
      shippingAddressId: shippingAddress._id,
      totalAmount,
      orderStatus: "pending",
      paymentStatus: paymentMethod === "manual" ? "pending" : "paid",
      note,
    });

    const transactionsPayload = items.map((item) => {
      const commissionRate = 5;
      const commissionAmount = Math.round(item.subtotal * 0.05);
      return {
        type: "sale",
        amount: item.subtotal,
        commissionRate,
        commissionAmount,
        netAmount: item.subtotal - commissionAmount,
        payerId: req.user.id,
        sellerId: item.sellerId,
        postId: item.postId,
        orderId: order._id,
        charityId: null,
        status: paymentMethod === "manual" ? "pending" : "paid",
        paymentMethod,
        metadata: { flow: "order-checkout" },
      };
    });

    const transactions = await Transaction.insertMany(transactionsPayload);

    const touchedPosts = new Set();
    for (const item of items) {
      const key = String(item.postId);
      if (touchedPosts.has(key)) continue;
      touchedPosts.add(key);

      await Post.findByIdAndUpdate(item.postId, {
        status: "sold",
        soldAt: new Date(),
        quantity: 0,
      });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Đặt đơn thành công",
      order,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? {}
      : { $or: [{ buyerId: req.user.id }, { "items.sellerId": req.user.id }] };

    const orders = await Order.find(query)
      .populate("buyerId", "username full_name phone")
      .populate("shippingAddressId")
      .populate("items.postId", "title images price status")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyerId", "username full_name phone")
      .populate("shippingAddressId")
      .populate("items.postId", "title images price status");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const isBuyer = String(order.buyerId?._id || order.buyerId) === String(req.user.id);
    const isSeller = order.items.some((item) => String(item.sellerId) === String(req.user.id));
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    const isSeller = order.items.some((item) => String(item.sellerId) === String(req.user.id));
    const isAdmin = req.user.role === "admin";
    if (!isSeller && !isAdmin) {
      return res.status(403).json({ message: "Ban khong co quyen cap nhat don hang" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    if (paymentStatus) {
      await Transaction.updateMany({ orderId: order._id }, { status: paymentStatus });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Khong tim thay don hang" });
    }

    if (String(order.buyerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Ban khong co quyen huy don hang nay" });
    }

    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Don hang khong o trang thai co the huy" });
    }

    order.orderStatus = "cancelled";
    await order.save();

    await Transaction.updateMany({ orderId: order._id }, { status: "failed", failReason: "Nguoi mua huy don" });

    res.json({ message: "Da huy don hang", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
