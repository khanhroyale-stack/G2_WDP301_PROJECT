import Report from "../models/report.model.js";
import Post from "../models/post.models.js";

export const createReport = async (req, res) => {
  try {
    const { postId, reason, details, reportType } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const existing = await Report.findOne({
      postId,
      reporterId: req.user.id,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Bạn đã báo cáo bài đăng này trước đó" });
    }

    const report = await Report.create({
      postId,
      reporterId: req.user.id,
      reason,
      details,
      reportType: reportType || "other",
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate("postId", "title status userId")
      .populate("reporterId", "username email")
      .populate("reviewedBy", "username email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote, resolutionAction } = req.body;

    if (!["resolved", "dismissed"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: action,
        adminNote: adminNote || "",
        reviewedBy: req.user.id,
        resolvedAt: action === "resolved" ? new Date() : null,
        resolutionAction:
          action === "dismissed"
            ? "dismissed"
            : resolutionAction || "hidden",
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
