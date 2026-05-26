import { useEffect, useMemo, useState } from "react";
import api, { getAuthConfig } from "../../utils/api";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [confirmingId, setConfirmingId] = useState("");

  const typeLabels = { sale: "Mua bán", donation: "Quyên góp" };
  const statusLabels = {
    pending: "Chờ xác nhận",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Đã hoàn tiền",
  };

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchTransactions = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.status) params.status = currentFilters.status;
      const res = await api.get("/transactions", { params, ...getAuthConfig() });
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status]);

  const confirmManual = async (id) => {
    if (!window.confirm("Xác nhận giao dịch này đã thanh toán?")) return;

    setConfirmingId(id);
    try {
      await api.patch(`/transactions/${id}/confirm-manual`, {}, getAuthConfig());
      alert("Đã xác nhận giao dịch");
      fetchTransactions(filters);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xác nhận giao dịch");
    } finally {
      setConfirmingId("");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Quản lý giao dịch</h2>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[180px_180px_120px]">
        <select
          value={filters.type}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả loại</option>
          <option value="sale">mua bán</option>
          <option value="donation">quyên góp</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="paid">đã thanh toán</option>
          <option value="pending">chờ xác nhận</option>
          <option value="failed">thất bại</option>
          <option value="refunded">đã hoàn tiền</option>
        </select>
        <button onClick={() => fetchTransactions(filters)} className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">Làm mới</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Hoa hồng</th>
              <th className="px-4 py-3">Thực nhận</th>
              <th className="px-4 py-3">Người trả</th>
              <th className="px-4 py-3">Tham chiếu</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="px-4 py-5 text-slate-500">Đang tải...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-5 text-slate-500">Chưa có giao dịch.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold uppercase">{typeLabels[tx.type] || tx.type}</td>
                  <td className="px-4 py-3">{money.format(Number(tx.amount || 0))}</td>
                  <td className="px-4 py-3">{money.format(Number(tx.commissionAmount || 0))}</td>
                  <td className="px-4 py-3">{money.format(Number(tx.netAmount || 0))}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{tx.payerId?.email || "khách"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{tx.postId?.title || tx.charityId?.title || "-"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">{statusLabels[tx.status] || tx.status}</span></td>
                  <td className="px-4 py-3">
                    {tx.type === "sale" && tx.status === "pending" ? (
                      <button
                        onClick={() => confirmManual(tx._id)}
                        disabled={confirmingId === tx._id}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {confirmingId === tx._id ? "Đang xử lý..." : "Xác nhận"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
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
