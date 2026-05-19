import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80";

const toImageUrl = (images) => {
  const first = Array.isArray(images) && images.length > 0 ? images[0] : "";
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  const normalized = first.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/favorites", getAuthConfig());
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRemove = async (postId) => {
    setRemovingId(postId);
    try {
      await api.delete(`/favorites/${postId}`, getAuthConfig());
      setFavorites((prev) => prev.filter((fav) => String(fav.postId?._id || fav.postId) !== String(postId)));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa khỏi yêu thích");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900">Sản phẩm yêu thích</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi các món đồ bạn quan tâm để quay lại mua nhanh.</p>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Đang tải danh sách...</div>
        ) : favorites.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Bạn chưa có sản phẩm yêu thích nào.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((fav) => {
              const post = fav.postId;
              const postId = post?._id || fav.postId;
              if (!post?._id) return null;

              return (
                <article key={fav._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={toImageUrl(post.images)}
                      alt={post.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase text-emerald-700">{post.category || "Khác"}</p>
                    <Link to={`/posts/${postId}`} className="mt-1 block text-lg font-bold text-slate-900 hover:text-emerald-700">
                      {post.title}
                    </Link>
                    <p className="mt-2 text-xl font-black text-slate-900">{money.format(Number(post.price || 0))}</p>
                    <p className="mt-2 text-xs text-slate-500">Trạng thái: {post.status}</p>

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/posts/${postId}`}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => onRemove(postId)}
                        disabled={removingId === postId}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removingId === postId ? "Đang xóa..." : "Bỏ thích"}
                      </button>
                    </div>
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
