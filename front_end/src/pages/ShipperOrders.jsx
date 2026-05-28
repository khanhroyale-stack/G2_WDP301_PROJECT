import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";

const orderStatusLabel = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const inspectionLabel = {
  pending: "Chờ kiểm định",
  approved: "Đạt yêu cầu",
  rejected: "Không đạt",
};

export default function ShipperOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [noteDraft, setNoteDraft] = useState({});

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipper/orders", getAuthConfig());
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const assignOrder = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/shipper/orders/${orderId}/assign`, {}, getAuthConfig());
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể nhận đơn");
    } finally {
      setUpdatingId("");
    }
  };

  const submitInspection = async (orderId, decision) => {
    setUpdatingId(orderId);
    try {
      await api.patch(
        `/shipper/orders/${orderId}/inspection`,
        { decision, note: noteDraft[orderId] || "" },
        getAuthConfig()
      );
      setNoteDraft((prev) => ({ ...prev, [orderId]: "" }));
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật kiểm định");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900">Đơn hàng cho Shipper</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhận đơn giao hàng và cập nhật kết quả kiểm định.
          </p>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Không có đơn hàng phù hợp.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {orders.map((order) => {
              const note = noteDraft[order._id] || "";
              const canAssign = !order.shipperId && order.orderStatus === "confirmed";
              const canInspect = order.shipperId && order.orderStatus === "shipping";

              return (
                <article key={order._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Mã đơn: {order._id}</p>
                      <p className="text-xs text-slate-500">
                        Người mua: {order.buyerId?.full_name || order.buyerId?.username || "Ẩn danh"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {orderStatusLabel[order.orderStatus] || order.orderStatus}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">
                        Kiểm định: {inspectionLabel[order.inspectionStatus] || order.inspectionStatus}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {(order.items || []).map((item, idx) => (
                      <div key={`${order._id}-${idx}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.postId?.title || "Sản phẩm"}</p>
                          <p className="text-xs text-slate-500">Số lượng {item.quantity}</p>
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

                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {canAssign && (
                        <button
                          onClick={() => assignOrder(order._id)}
                          disabled={updatingId === order._id}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === order._id ? "Đang nhận..." : "Nhận giao"}
                        </button>
                      )}
                    </div>

                    {canInspect && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-bold text-slate-700">Kết quả kiểm định</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                          <input
                            value={note}
                            onChange={(e) => setNoteDraft((prev) => ({ ...prev, [order._id]: e.target.value }))}
                            placeholder="Ghi chú kiểm định (nếu có)"
                            className="rounded-lg border border-slate-300 px-3 py-2"
                          />
                          <button
                            onClick={() => submitInspection(order._id, "approved")}
                            disabled={updatingId === order._id}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Đạt
                          </button>
                          <button
                            onClick={() => submitInspection(order._id, "rejected")}
                            disabled={updatingId === order._id}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Không đạt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
