import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/user.models.js";
import AdminProfile from "../models/admin.model.js";
import ShipperProfile from "../models/shipper.model.js";
import Category from "../models/category.model.js";
import Address from "../models/address.model.js";
import Charity from "../models/charity.model.js";
import Post from "../models/post.models.js";
import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import Shipment from "../models/shipment.model.js";

dotenv.config();

const hashPassword = async (password) => bcrypt.hash(password, 10);

const upsertUser = async ({ username, email, password, full_name, phone, address, role, status }) => {
  const hashedPassword = await hashPassword(password);
  return User.findOneAndUpdate(
    { email },
    {
      username,
      email,
      password: hashedPassword,
      full_name,
      phone,
      address,
      role,
      status,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const run = async () => {
  try {
    await connectDB();

    const admin = await upsertUser({
      username: "admin",
      email: "admin@greenloop.local",
      password: "Admin123!",
      full_name: "System Admin",
      phone: "0900000001",
      address: "Ha Noi",
      role: "admin",
      status: "active",
    });

    const shipper = await upsertUser({
      username: "shipper01",
      email: "shipper@greenloop.local",
      password: "Shipper123!",
      full_name: "Shipper One",
      phone: "0900000002",
      address: "Ha Noi",
      role: "shipper",
      status: "active",
    });

    const seller = await upsertUser({
      username: "seller01",
      email: "seller@greenloop.local",
      password: "Seller123!",
      full_name: "Seller One",
      phone: "0900000003",
      address: "Ha Noi",
      role: "user",
      status: "active",
    });

    const buyer = await upsertUser({
      username: "buyer01",
      email: "buyer@greenloop.local",
      password: "Buyer123!",
      full_name: "Buyer One",
      phone: "0900000004",
      address: "Ha Noi",
      role: "user",
      status: "active",
    });

    await AdminProfile.findOneAndUpdate(
      { userId: admin._id },
      {
        userId: admin._id,
        permissions: ["manage_users", "manage_posts", "manage_orders", "manage_reports"],
        department: "operations",
        note: "Seeded admin profile",
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await ShipperProfile.findOneAndUpdate(
      { userId: shipper._id },
      {
        userId: shipper._id,
        vehicleType: "motorbike",
        licensePlate: "29A-12345",
        serviceAreas: ["Ha Noi"],
        status: "active",
        currentOrderCount: 0,
        note: "Seeded shipper profile",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const category = await Category.findOneAndUpdate(
      { slug: "dien-thoai" },
      { name: "Điện thoại", slug: "dien-thoai", level: 1, isActive: true, sortOrder: 1, icon: "" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Charity.findOneAndUpdate(
      { title: "Chương trình hỗ trợ cộng đồng" },
      {
        title: "Chương trình hỗ trợ cộng đồng",
        description: "Quỹ hỗ trợ các hoạt động cộng đồng và vận hành hệ thống.",
        shortDescription: "Hỗ trợ cộng đồng",
        highlightMessage: "Cùng nhau tạo giá trị tốt đẹp hơn.",
        goalAmount: 10000000,
        currentAmount: 1500000,
        status: "active",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const address = await Address.findOneAndUpdate(
      { userId: buyer._id, street: "100 Le Loi" },
      {
        userId: buyer._id,
        fullName: buyer.full_name,
        phone: buyer.phone,
        province: "Ha Noi",
        district: "Ba Dinh",
        ward: "Phuong 1",
        street: "100 Le Loi",
        note: "Seed default address",
        isDefault: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const post = await Post.findOneAndUpdate(
      { title: "iPhone 12 Pro Max đã qua sử dụng" },
      {
        title: "iPhone 12 Pro Max đã qua sử dụng",
        description: "Máy còn đẹp, pin tốt, full chức năng.",
        price: 12000000,
        images: ["https://placehold.co/600x400"],
        category: category?.name || "Điện thoại",
        categoryId: category?._id || null,
        tags: ["iphone", "dien-thoai"],
        userId: seller._id,
        status: "approved",
        condition: "good",
        brand: "Apple",
        color: "Black",
        size: "",
        locationCity: "Ha Noi",
        locationDistrict: "Ba Dinh",
        shippingType: "both",
        shippingFee: 30000,
        isFreeShip: false,
        quantity: 1,
        approvedAt: new Date(),
        approvedBy: admin._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const existingOrder = await Order.findOne({ note: "seed-order-001" });
    const order = existingOrder || await Order.create({
      buyerId: buyer._id,
      items: [
        {
          postId: post._id,
          sellerId: seller._id,
          quantity: 1,
          unitPrice: 12000000,
          subtotal: 12000000,
        },
      ],
      shippingAddressId: address._id,
      totalAmount: 12000000,
      orderStatus: "shipping",
      paymentStatus: "paid",
      note: "seed-order-001",
    });

    await Transaction.findOneAndUpdate(
      { orderId: order._id, type: "sale" },
      {
        type: "sale",
        amount: 12000000,
        commissionRate: 5,
        commissionAmount: 600000,
        netAmount: 11400000,
        payerId: buyer._id,
        sellerId: seller._id,
        postId: post._id,
        charityId: null,
        orderId: order._id,
        status: "paid",
        paymentMethod: "manual",
        metadata: { seeded: true },
        paidAt: new Date(),
        confirmedAt: new Date(),
        confirmedBy: admin._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Shipment.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId: order._id,
        shipperId: shipper._id,
        assignedBy: admin._id,
        trackingCode: `SEED-${String(order._id).slice(-8).toUpperCase()}`,
        status: "in_transit",
        deliveryFee: 30000,
        pickupAt: new Date(),
        note: "Seed shipment",
        timeline: [
          { status: "assigned", note: "Gán shipper", updatedBy: admin._id, at: new Date() },
          { status: "picked_up", note: "Đã lấy hàng", updatedBy: shipper._id, at: new Date() },
          { status: "in_transit", note: "Đang giao hàng", updatedBy: shipper._id, at: new Date() },
        ],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();