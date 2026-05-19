import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getAuthConfig } from "../../utils/api";

const statusLabels = {
  pending: "Chờ xử lý",
  resolved: "Đã xử lý",
  dismissed: "Bỏ qua",
};

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchReports = async (currentStatus = status) => {
    setLoading(true);
    try {
      const params = {};
      if (currentStatus) params.status = currentStatus;
      const res = await api.get("/reports", { params, ...getAuthConfig() });
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const review = async (id, action) => {
    const adminNote = window.prompt("Ghi chú quản trị (không bắt buộc):", "") || "";
    try {
      await api.patch(`/reports/${id}/review`, { action, adminNote }, getAuthConfig());
      fetchReports();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xử lý báo cáo");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Kiểm duyệt báo cáo</h2>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[220px_120px]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">chờ xử lý</option>
          <option value="resolved">đã xử lý</option>
          <option value="dismissed">bỏ qua</option>
        </select>
        <button onClick={() => fetchReports(status)} className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">Làm mới</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">Đang tải...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">Chưa có báo cáo nào.</div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Bài đăng</p>
                  <p className="font-bold text-slate-900">{report.postId?.title || "Không xác định"}</p>
                  {report.postId?._id ? (
                    <Link to={`/posts/${report.postId._id}`} className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                      Xem chi tiết bài đăng
                    </Link>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-700">Lý do: {report.reason}</p>
                  {report.details ? <p className="text-sm text-slate-600">Chi tiết: {report.details}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">Người báo cáo: {report.reporterId?.email || "-"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">{statusLabels[report.status] || report.status}</span>
              </div>

              {report.status === "pending" ? (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => review(report._id, "resolved")}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Xử lý
                  </button>
                  <button
                    onClick={() => review(report._id, "dismissed")}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Bỏ qua
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
