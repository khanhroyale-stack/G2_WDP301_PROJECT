import Favorite from "../models/favorite.model.js";
import Post from "../models/post.models.js";

export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate("postId", "title price images status category userId")
      .sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    if (String(post.userId) === String(req.user.id)) {
      return res.status(400).json({ message: "Không thể yêu thích bài đăng của chính bạn" });
    }

    const existing = await Favorite.findOne({ userId: req.user.id, postId });
    if (existing) {
      return res.status(200).json({ message: "Bài đăng đã có trong danh sách yêu thích", favorite: existing });
    }

    const favorite = await Favorite.create({ userId: req.user.id, postId });
    await Post.findByIdAndUpdate(postId, { $inc: { favoriteCount: 1 } });

    res.status(201).json({ message: "Đã thêm vào yêu thích", favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { postId } = req.params;
    const deleted = await Favorite.findOneAndDelete({ userId: req.user.id, postId });
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy bài yêu thích" });
    }

    await Post.findByIdAndUpdate(postId, { $inc: { favoriteCount: -1 } });

    res.json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
