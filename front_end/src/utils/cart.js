import api, { getAuthConfig } from "./api";

const CART_UPDATED_EVENT = "cart-updated";

export const emitCartUpdated = () => {
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

export const onCartUpdated = (handler) => {
  window.addEventListener(CART_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
};

export const fetchCart = async () => {
  const res = await api.get("/cart", getAuthConfig());
  return res.data;
};

export const fetchCartCount = async () => {
  const res = await api.get("/cart/count", getAuthConfig());
  return Number(res.data?.count || 0);
};

export const addToCart = async (postId, quantity = 1) => {
  const res = await api.post("/cart/items", { postId, quantity }, getAuthConfig());
  emitCartUpdated();
  return res.data;
};

export const updateCartQuantity = async (postId, quantity) => {
  const res = await api.patch(`/cart/items/${postId}`, { quantity }, getAuthConfig());
  emitCartUpdated();
  return res.data;
};

export const removeCartItem = async (postId) => {
  const res = await api.delete(`/cart/items/${postId}`, getAuthConfig());
  emitCartUpdated();
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart/clear", getAuthConfig());
  emitCartUpdated();
  return res.data;
};
