import Post from "../models/post.models.js";
import User from "../models/user.models.js";
import Category from "../models/category.model.js";

const normalizeTags = (rawTags) => {
  let source = rawTags;

  if (typeof source === "string") {
    const trimmed = source.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        source = JSON.parse(trimmed);
      } catch {
        source = trimmed.split(",");
      }
    } else {
      source = trimmed.split(",");
    }
  }

  if (!Array.isArray(source)) return [];

  const cleaned = source
    .map((tag) =>
      String(tag || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)
    .slice(0, 10);

  return [...new Set(cleaned)];
};

export const createPost = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      categoryId,
      condition = "good",
      brand = "",
      color = "",
      size = "",
      locationCity = "",
      locationDistrict = "",
      shippingType = "both",
      shippingFee = 0,
      isFreeShip = false,
      quantity = 1,
      tags,
    } = req.body;

    const uploadedImages = (req.files || []).map((file) =>
      file.path.replace(/\\/g, "/"),
    );
    const bodyImages = Array.isArray(req.body.images) ? req.body.images : [];
    const images = uploadedImages.length > 0 ? uploadedImages : bodyImages;

    const normalizedTags = normalizeTags(tags);

    const normalizedCategoryId = String(categoryId || "").trim();
    let finalCategoryId = null;
    let finalCategory = String(category || "").trim();

    if (normalizedCategoryId) {
      const selectedCategory = await Category.findById(normalizedCategoryId);
      if (!selectedCategory) {
        return res.status(400).json({ message: "Khong tim thay danh muc" });
      }
      finalCategoryId = selectedCategory._id;
      finalCategory = selectedCategory.name;
    }

    const post = new Post({
      title,
      description,
      images,
      userId: req.user.id,
      category: finalCategory,
      categoryId: finalCategoryId,
      tags: normalizedTags,
      status: "pending",
      rejectReason: "",
      price,
      condition,
      brand,
      color,
      size,
      locationCity,
      locationDistrict,
      shippingType,
      shippingFee,
      isFreeShip,
      quantity,
    });

    await post.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { postCount: 1 } });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { search, category, status = "all" } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (status === "available") {
      query.status = "approved";
    } else if (status === "sold") {
      query.status = "sold";
    } else {
      query.status = { $in: ["approved", "sold"] };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostCategories = async (req, res) => {
  try {
    const categories = await Post.aggregate([
      {
        $match: {
          status: { $in: ["approved", "sold"] },
          category: { $type: "string", $ne: "" },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    const posts = await Post.find(query).sort({ updatedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsForModeration = async (req, res) => {
  try {
    const { status = "pending", search, category } = req.query;
    const query = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .populate("userId", "username email full_name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username full_name phone",
    );
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    if (!["approved", "sold"].includes(post.status)) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const isOwner = post.userId?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể cập nhật bài đăng của chính mình" });
    }

    const {
      title,
      description,
      price,
      images,
      category,
      categoryId,
      condition,
      brand,
      color,
      size,
      locationCity,
      locationDistrict,
      shippingType,
      shippingFee,
      isFreeShip,
      quantity,
      tags,
    } = req.body;
    const uploadedImages = (req.files || []).map((file) =>
      file.path.replace(/\\/g, "/"),
    );
    const hasTagsInput = tags !== undefined;
    const normalizedTags = normalizeTags(tags);

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (price !== undefined) post.price = price;
    if (categoryId !== undefined) {
      const normalizedCategoryId = String(categoryId || "").trim();
      if (!normalizedCategoryId) {
        post.categoryId = null;
      } else {
        const selectedCategory = await Category.findById(normalizedCategoryId);
        if (!selectedCategory) {
          return res.status(400).json({ message: "Khong tim thay danh muc" });
        }
        post.categoryId = selectedCategory._id;
        post.category = selectedCategory.name;
      }
    }

    if (category !== undefined) post.category = String(category || "").trim();
    if (condition !== undefined) post.condition = condition;
    if (brand !== undefined) post.brand = brand;
    if (color !== undefined) post.color = color;
    if (size !== undefined) post.size = size;
    if (locationCity !== undefined) post.locationCity = locationCity;
    if (locationDistrict !== undefined)
      post.locationDistrict = locationDistrict;
    if (shippingType !== undefined) post.shippingType = shippingType;
    if (shippingFee !== undefined) post.shippingFee = shippingFee;
    if (isFreeShip !== undefined) post.isFreeShip = isFreeShip;
    if (quantity !== undefined) post.quantity = quantity;
    if (hasTagsInput) post.tags = normalizedTags;
    if (uploadedImages.length > 0) {
      post.images = uploadedImages;
    } else if (Array.isArray(images)) {
      post.images = images;
    }

    post.status = "pending";
    post.rejectReason = "";
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const isOwner = post.userId?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể xóa bài đăng của chính mình" });
    }

    await Post.findByIdAndDelete(req.params.id);

    if (post.userId) {
      await User.findByIdAndUpdate(post.userId, { $inc: { postCount: -1 } });
    }

    res.json({ message: "Đã xóa bài đăng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved", rejectReason: "" },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectReason: reason || "Rejected by admin" },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markPostAsSold = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    const isOwner = post.userId?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message: "Bạn chỉ có thể đánh dấu đã bán cho bài đăng của chính mình",
        });
    }

    post.status = "sold";
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySoldPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id, status: "sold" }).sort(
      { updatedAt: -1 },
    );
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
