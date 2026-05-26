import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";

export default function Transactions() {
  const user = getStoredUser();
  const currentUserId = getUserId(user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState("");

  const typeLabels = { sale: "Mua bán", donation: "Quyên góp" };
  const statusLabels = {
    pending: "Chờ xác nhận",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Đã hoàn tiền",
  };
  const methodLabels = { manual: "Thủ công" };

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions/me", getAuthConfig());
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const confirmManual = async (id) => {
    if (!window.confirm("Xác nhận đã nhận tiền/chuyển khoản cho giao dịch này?")) return;

    setConfirmingId(id);
    try {
      await api.patch(`/transactions/${id}/confirm-manual`, {}, getAuthConfig());
      alert("Đã xác nhận giao dịch");
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xác nhận giao dịch");
    } finally {
      setConfirmingId("");
    }
  };

  const canConfirm = (tx) => {
    const isPendingSale = tx.type === "sale" && tx.status === "pending";
    if (!isPendingSale || !currentUserId) return false;

    const sellerId = tx.sellerId?._id || tx.sellerId;
    const isSeller = sellerId && String(sellerId) === String(currentUserId);
    const isAdmin = user.role === "admin";

    return Boolean(isSeller || isAdmin);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black">Giao dịch của tôi</h2>
          <p className="mt-1 text-sm text-slate-500">Lịch sử giao dịch mua bán và quyên góp.</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Hoa hồng</th>
                <th className="px-4 py-3">Thực nhận</th>
                <th className="px-4 py-3">Tham chiếu</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-slate-500">Đang tải...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-slate-500">Chưa có giao dịch nào.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold">{typeLabels[tx.type] || tx.type}</td>
                    <td className="px-4 py-3">{money.format(Number(tx.amount || 0))}</td>
                    <td className="px-4 py-3">{money.format(Number(tx.commissionAmount || 0))}</td>
                    <td className="px-4 py-3">{money.format(Number(tx.netAmount || 0))}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tx.postId?.title || tx.charityId?.title || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{methodLabels[tx.paymentMethod] || tx.paymentMethod || "Thủ công"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                        tx.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : tx.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>{statusLabels[tx.status] || tx.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {canConfirm(tx) ? (
                        <button
                          onClick={() => confirmManual(tx._id)}
                          disabled={confirmingId === tx._id}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {confirmingId === tx._id ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
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
    </div>
  );
}
