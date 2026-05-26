import { useEffect, useState } from "react";
import api, { getAuthConfig } from "../../utils/api";

const Card = ({ title, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
  </div>
);

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stats", getAuthConfig());
      setStats(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="rounded-xl bg-white p-4">Đang tải thống kê...</div>;
  }

  if (!stats) {
    return <div className="rounded-xl bg-white p-4">Không có dữ liệu thống kê.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900">Tổng quan quản trị</h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Tổng người dùng" value={stats.users?.totalUsers || 0} hint={`Hoạt động ${stats.users?.activeUsers || 0} • Bị khóa ${stats.users?.bannedUsers || 0}`} />
        <Card title="Tổng bài đăng" value={stats.posts?.totalPosts || 0} hint={`Chờ duyệt ${stats.posts?.pendingPosts || 0} • Đã duyệt ${stats.posts?.approvedPosts || 0}`} />
        <Card title="Báo cáo chờ xử lý" value={stats.reports?.pendingReports || 0} hint={`Tổng ${stats.reports?.totalReports || 0}`} />
        <Card title="Giao dịch" value={stats.transactions?.totalTransactions || 0} hint={`Hoa hồng ${Number(stats.transactions?.totalCommission || 0).toLocaleString()} VND`} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Tình hình chợ đồ cũ</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Chờ duyệt</p>
            <p className="text-2xl font-black">{stats.posts?.pendingPosts || 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Đã duyệt</p>
            <p className="text-2xl font-black">{stats.posts?.approvedPosts || 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Đã bán</p>
            <p className="text-2xl font-black">{stats.posts?.soldPosts || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
