import { useEffect, useMemo, useState } from "react";
import api, { getAuthConfig } from "../../utils/api";

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

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [filters, setFilters] = useState({ orderStatus: "", paymentStatus: "" });

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/me", getAuthConfig());
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onUpdate = async (id, payload) => {
    setUpdatingId(id);
    try {
      await api.patch(`/orders/${id}/status`, payload, getAuthConfig());
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật trạng thái đơn");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.orderStatus && order.orderStatus !== filters.orderStatus) return false;
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;
      return true;
    });
  }, [filters.orderStatus, filters.paymentStatus, orders]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Quản lý đơn hàng</h2>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[220px_220px_120px]">
        <select
          value={filters.orderStatus}
          onChange={(e) => setFilters((prev) => ({ ...prev, orderStatus: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả trạng thái đơn</option>
          <option value="pending">chờ xác nhận</option>
          <option value="confirmed">đã xác nhận</option>
          <option value="shipping">đang giao</option>
          <option value="completed">hoàn tất</option>
          <option value="cancelled">đã hủy</option>
        </select>
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả trạng thái thanh toán</option>
          <option value="pending">chưa thanh toán</option>
          <option value="paid">đã thanh toán</option>
          <option value="failed">lỗi</option>
          <option value="refunded">hoàn tiền</option>
        </select>
        <button onClick={fetchOrders} className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Người mua</th>
              <th className="px-4 py-3">Số món</th>
              <th className="px-4 py-3">Tổng tiền</th>
              <th className="px-4 py-3">Trạng thái đơn</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-5 text-slate-500">Đang tải...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-5 text-slate-500">Không có đơn hàng phù hợp.</td></tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-xs text-slate-600">{order._id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{order.buyerId?.full_name || order.buyerId?.username || "Ẩn danh"}</td>
                  <td className="px-4 py-3">{(order.items || []).length}</td>
                  <td className="px-4 py-3 font-semibold">{money.format(Number(order.totalAmount || 0))}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">
                      {orderStatusLabel[order.orderStatus] || order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">
                      {paymentStatusLabel[order.paymentStatus] || order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => onUpdate(order._id, { orderStatus: e.target.value })}
                        disabled={updatingId === order._id}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipping">shipping</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>

                      <select
                        value={order.paymentStatus}
                        onChange={(e) => onUpdate(order._id, { paymentStatus: e.target.value })}
                        disabled={updatingId === order._id}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                        <option value="refunded">refunded</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
