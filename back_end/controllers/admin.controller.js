import User from "../models/user.models.js";
import Post from "../models/post.models.js";
import Report from "../models/report.model.js";
import Transaction from "../models/transaction.model.js";

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
