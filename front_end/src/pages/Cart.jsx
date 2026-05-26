import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import {
  clearCart,
  emitCartUpdated,
  fetchCart,
  removeCartItem,
} from "../utils/cart";
import { getStoredUser, getUserId } from "../utils/auth";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80";

const toImageUrl = (images) => {
  const first = Array.isArray(images) && images.length > 0 ? images[0] : "";
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  const normalized = first.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

export default function Cart() {
  const user = getStoredUser();
  const currentUserId = getUserId(user);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      if ([401, 403].includes(Number(error?.response?.status || 0))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      alert(error.response?.data?.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await api.get("/addresses", getAuthConfig());
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list);
      const defaultAddress = list.find((addr) => addr.isDefault);
      setSelectedAddressId(defaultAddress?._id || list[0]?._id || "");
    } catch (error) {
      if ([401, 403].includes(Number(error?.response?.status || 0))) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setAddresses([]);
      setSelectedAddressId("");
      alert(error.response?.data?.message || "Không thể tải danh sách địa chỉ");
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    loadCart();
    loadAddresses();
  }, [currentUserId, loadAddresses, loadCart, navigate]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item?.postId?.price || item?.priceAtAdd || 0);
      return sum + price;
    }, 0);
  }, [items]);

  const onRemoveItem = async (postId) => {
    try {
      await removeCartItem(postId);
      setItems((prev) => prev.filter((item) => String(item.postId?._id || item.postId) !== String(postId)));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const onClear = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    try {
      await clearCart();
      setItems([]);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa giỏ hàng");
    }
  };

  const onCheckout = async () => {
    if (items.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }

    if (!selectedAddressId) {
      alert("Vui lòng chọn hoặc thêm địa chỉ giao hàng trước khi đặt đơn");
      return;
    }

    if (!window.confirm(`Xác nhận đặt đơn cho ${items.length} sản phẩm?`)) {
      return;
    }

    setCheckingOut(true);
    try {
      await api.post(
        "/orders/checkout",
        {
          addressId: selectedAddressId,
          note: checkoutNote.trim(),
          paymentMethod: "manual",
        },
        getAuthConfig()
      );

      emitCartUpdated();
      await loadCart();
      alert("Đặt đơn thành công. Bạn có thể theo dõi ở trang Đơn hàng.");
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể đặt đơn từ giỏ hàng");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">Giỏ hàng của bạn</h1>
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="rounded-2xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-50"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Đang tải giỏ hàng...</p>
          ) : items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-slate-600">Giỏ hàng hiện đang trống</p>
              <Link
                to="/posts"
                className="mt-4 inline-block rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Đi tới chợ đồ cũ
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {items.map((item) => {
                const post = item.postId;
                const itemId = String(post?._id || item.postId);
                const price = Number(post?.price || item.priceAtAdd || 0);
                return (
                  <div
                    key={itemId}
                    className="grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[120px_1fr_auto]"
                  >
                    <img
                      src={toImageUrl(post?.images)}
                      alt={post?.title || "item"}
                      className="h-28 w-full rounded-xl object-cover"
                    />

                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">{post?.category || "Khác"}</p>
                      <Link to={`/posts/${itemId}`} className="mt-1 block font-bold text-slate-900 hover:text-emerald-700">
                        {post?.title || "Sản phẩm không còn khả dụng"}
                      </Link>
                      <p className="mt-2 text-lg font-black text-slate-900">{money.format(price)}</p>
                    </div>

                    <div className="flex items-end gap-2 sm:flex-col sm:items-stretch">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                        1 món
                      </div>
                      <button
                        onClick={() => onRemoveItem(itemId)}
                        className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Tạm tính</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Số sản phẩm</span>
            <span>{items.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
            <span>Phí nền tảng</span>
            <span>Thanh toán thủ công</span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Tổng cộng</span>
              <span className="text-2xl font-black text-slate-900">{money.format(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Địa chỉ giao hàng</label>
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                Bạn chưa có địa chỉ giao hàng.
                <Link to="/addresses" className="ml-1 font-semibold text-emerald-700 underline">
                  Thêm địa chỉ
                </Link>
              </div>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-2.5"
              >
                {addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.fullName} - {addr.phone} - {addr.street}
                  </option>
                ))}
              </select>
            )}
          </div>

          <textarea
            rows={2}
            value={checkoutNote}
            onChange={(e) => setCheckoutNote(e.target.value)}
            placeholder="Ghi chú cho người bán (không bắt buộc)"
            className="mt-3 w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm"
          />

          <button
            disabled={checkingOut || items.length === 0}
            onClick={onCheckout}
            className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkingOut ? "Đang đặt đơn..." : "Đặt đơn từ giỏ hàng"}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            Thanh toán thủ công, người bán xác nhận và cập nhật trạng thái đơn trực tiếp.
          </p>
        </aside>
      </div>
    </div>
  );
}
