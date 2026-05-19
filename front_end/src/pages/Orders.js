import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";

const orderStatusLabel = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const paymentStatusLabel = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Lỗi thanh toán",
  refunded: "Đã hoàn tiền",
};

export default function Orders() {
  const user = getStoredUser();
  const currentUserId = getUserId(user);

  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [reviewDraft, setReviewDraft] = useState({});

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const reviewedOrderIds = useMemo(() => {
    return new Set(
      (Array.isArray(myReviews) ? myReviews : [])
        .map((r) => String(r.orderId?._id || r.orderId || ""))
        .filter(Boolean)
    );
  }, [myReviews]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        api.get("/orders/me", getAuthConfig()),
        api.get("/reviews/me", getAuthConfig()),
      ]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setMyReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, payload) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, payload, getAuthConfig());
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật trạng thái đơn");
    } finally {
      setUpdatingId("");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn này?")) return;
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`, {}, getAuthConfig());
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setUpdatingId("");
    }
  };

  const submitReview = async (orderId) => {
    const draft = reviewDraft[orderId] || { rating: 5, comment: "" };
    setReviewingId(orderId);
    try {
      await api.post(
        "/reviews",
        { orderId, rating: Number(draft.rating || 5), comment: draft.comment || "" },
        getAuthConfig()
      );
      setReviewDraft((prev) => ({ ...prev, [orderId]: { rating: 5, comment: "" } }));
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setReviewingId("");
    }
  };

  const isBuyer = (order) => {
    const buyerId = order?.buyerId?._id || order?.buyerId;
    return currentUserId && String(buyerId) === String(currentUserId);
  };

  const isSeller = (order) => {
    return (order?.items || []).some((item) => String(item.sellerId) === String(currentUserId));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900">Đơn hàng</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi toàn bộ đơn mua và đơn bán của bạn.</p>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((order) => {
              const mineAsBuyer = isBuyer(order);
              const mineAsSeller = isSeller(order);
              const reviewed = reviewedOrderIds.has(String(order._id));
              const canReview = mineAsBuyer && order.orderStatus === "completed" && !reviewed;
              const draft = reviewDraft[order._id] || { rating: 5, comment: "" };

              return (
                <article key={order._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Mã đơn: {order._id}</p>
                      <p className="text-xs text-slate-500">Người mua: {order.buyerId?.full_name || order.buyerId?.username || "Ẩn danh"}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {orderStatusLabel[order.orderStatus] || order.orderStatus}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        Thanh toán: {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={`${order._id}-${idx}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.postId?.title || "Sản phẩm"}</p>
                          <p className="text-xs text-slate-500">Số lượng {item.quantity} • Đơn giá {money.format(Number(item.unitPrice || 0))}</p>
                        </div>
                        <p className="font-bold text-slate-900">{money.format(Number(item.subtotal || 0))}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 md:grid-cols-3">
                    <p>
                      Địa chỉ: <span className="font-semibold">{order.shippingAddressId?.street || "-"}</span>
                    </p>
                    <p>
                      Người nhận: <span className="font-semibold">{order.shippingAddressId?.fullName || "-"}</span>
                    </p>
                    <p>
                      Tổng tiền: <span className="font-bold text-slate-900">{money.format(Number(order.totalAmount || 0))}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mineAsBuyer && ["pending", "confirmed"].includes(order.orderStatus) ? (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        disabled={updatingId === order._id}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === order._id ? "Đang xử lý..." : "Hủy đơn"}
                      </button>
                    ) : null}

                    {mineAsSeller && order.orderStatus === "pending" ? (
                      <button
                        onClick={() => updateStatus(order._id, { orderStatus: "confirmed" })}
                        disabled={updatingId === order._id}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Xác nhận đơn
                      </button>
                    ) : null}

                    {mineAsSeller && order.orderStatus === "confirmed" ? (
                      <button
                        onClick={() => updateStatus(order._id, { orderStatus: "shipping" })}
                        disabled={updatingId === order._id}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Bắt đầu giao
                      </button>
                    ) : null}

                    {mineAsSeller && order.orderStatus === "shipping" ? (
                      <button
                        onClick={() => updateStatus(order._id, { orderStatus: "completed", paymentStatus: "paid" })}
                        disabled={updatingId === order._id}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hoàn tất đơn
                      </button>
                    ) : null}
                  </div>

                  {canReview ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-bold text-amber-800">Đánh giá người bán</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
                        <select
                          value={draft.rating}
                          onChange={(e) =>
                            setReviewDraft((prev) => ({
                              ...prev,
                              [order._id]: { ...draft, rating: Number(e.target.value) },
                            }))
                          }
                          className="rounded-lg border border-amber-300 px-2 py-2"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>{value} sao</option>
                          ))}
                        </select>
                        <input
                          value={draft.comment}
                          onChange={(e) =>
                            setReviewDraft((prev) => ({
                              ...prev,
                              [order._id]: { ...draft, comment: e.target.value },
                            }))
                          }
                          placeholder="Nhận xét của bạn"
                          className="rounded-lg border border-amber-300 px-3 py-2"
                        />
                        <button
                          onClick={() => submitReview(order._id)}
                          disabled={reviewingId === order._id}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === order._id ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
