import Cart from "../models/cart.model.js";
import Post from "../models/post.models.js";

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const sanitizeCart = async (cart) => {
  const populated = await cart.populate("items.postId", "title price status images category userId");

  const beforeCount = populated.items.length;
  populated.items = populated.items.filter((item) => {
    const post = item.postId;
    if (!post) return false;
    return post.status === "approved" && String(post.userId) !== String(cart.userId);
  });

  if (populated.items.length !== beforeCount) {
    await populated.save();
  }

  return populated;
};

export const getCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);
    const cleanCart = await sanitizeCart(cart);
    res.json(cleanCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);
    const cleanCart = await sanitizeCart(cart);
    const count = cleanCart.items.length;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    if (post.status !== "approved") {
      return res.status(400).json({ message: "Bài đăng này không khả dụng để thêm vào giỏ" });
    }

    if (String(post.userId) === String(req.user.id)) {
      return res.status(400).json({ message: "Bạn không thể thêm bài đăng của chính mình vào giỏ" });
    }

    const cart = await findOrCreateCart(req.user.id);
    const existingIndex = cart.items.findIndex((item) => String(item.postId) === String(postId));

    if (existingIndex >= 0) {
      cart.items[existingIndex].priceAtAdd = Number(post.price || 0);
    } else {
      cart.items.push({
        postId: post._id,
        quantity: 1,
        priceAtAdd: Number(post.price || 0),
      });
    }

    await cart.save();
    const cleanCart = await sanitizeCart(cart);

    res.status(201).json({
      message: "Đã thêm vào giỏ hàng",
      cart: cleanCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { postId } = req.params;
    const { quantity } = req.body;

    const cart = await findOrCreateCart(req.user.id);
    const item = cart.items.find((it) => String(it.postId) === String(postId));
    if (!item) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
    }

    item.quantity = quantity;
    await cart.save();

    const cleanCart = await sanitizeCart(cart);
    res.json({ message: "Đã cập nhật giỏ hàng", cart: cleanCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { postId } = req.params;
    const cart = await findOrCreateCart(req.user.id);

    cart.items = cart.items.filter((item) => String(item.postId) !== String(postId));
    await cart.save();

    const cleanCart = await sanitizeCart(cart);
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ", cart: cleanCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await findOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();

    res.json({ message: "Đã xóa toàn bộ giỏ hàng", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
