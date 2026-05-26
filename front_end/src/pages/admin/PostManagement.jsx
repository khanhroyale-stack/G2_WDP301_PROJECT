import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Trash2 } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

const toImageUrl = (images) => {
  const first = Array.isArray(images) && images.length > 0 ? images[0] : "";
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  const normalized = first.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  sold: "Đã bán",
};

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPosts = async (status = statusFilter) => {
    try {
      const params = status ? { status } : {};
      const res = await axios.get("http://localhost:8000/api/posts/moderation", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, token]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/posts/${id}/approve`, {}, config);
      fetchPosts(statusFilter);
    } catch (err) {
      alert("Lỗi khi duyệt bài");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await axios.delete(`http://localhost:8000/api/posts/${id}`, config);
        fetchPosts(statusFilter);
      } catch (err) {
        alert("Lỗi khi xóa bài");
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Ly do tu choi bai dang:", "");
    if (reason === null) return;

    try {
      await axios.patch(`http://localhost:8000/api/posts/${id}/reject`, { reason }, config);
      fetchPosts(statusFilter);
    } catch (err) {
      alert("Lỗi khi reject bài");
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Kiểm duyệt bài đăng</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="pending">chờ duyệt</option>
          <option value="approved">đã duyệt</option>
          <option value="rejected">bị từ chối</option>
          <option value="sold">đã bán</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Không có bài đăng ở trạng thái này.
          </div>
        ) : (
          posts.map((p) => (
            <article key={p._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-100">
                <img
                  src={toImageUrl(p.images)}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{p.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      p.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : p.status === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm text-slate-600">{p.description || "Không có mô tả"}</p>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Danh mục</p>
                    <p className="font-semibold text-slate-800">{p.category || "others"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Giá</p>
                    <p className="font-bold text-slate-900">{Number(p.price || 0).toLocaleString()}đ</p>
                  </div>
                </div>

                {p.userId && (
                  <p className="text-xs text-slate-500">
                    Người đăng: <span className="font-semibold text-slate-700">{p.userId.full_name || p.userId.username || "Ẩn danh"}</span>
                  </p>
                )}

                {p.rejectReason ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">Lý do từ chối: {p.rejectReason}</p> : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  {p.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        title="Duyệt bài"
                      >
                        <CheckCircle size={16} /> Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                        title="Từ chối bài"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700"
                    title="Xóa bài"
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
