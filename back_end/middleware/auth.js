import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Không có token xác thực" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("status role");
    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.status === "banned") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ admin." });
    }

    req.user = {
      ...decoded,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Bạn không có quyền truy cập chức năng quản trị" });
  }
};