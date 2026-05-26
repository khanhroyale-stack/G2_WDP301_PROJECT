import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";
import { addToCart } from "../utils/cart";
import { toVietnameseDisplay } from "../utils/vietnameseText";

const parseQueryFromSearch = (search) => {
  const params = new URLSearchParams(search);
  const status = params.get("status") || "all";
  const normalizedStatus = ["all", "available", "sold"].includes(status) ? status : "all";
  return {
    search: params.get("search") || "",
    category: params.get("category") || "",
    status: normalizedStatus,
  };
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80";

const toImageUrl = (images) => {
  const first = Array.isArray(images) && images.length > 0 ? images[0] : "";
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  const normalized = first.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

function Posts() {
  const location = useLocation();
  const user = getStoredUser();
  const currentUserId = getUserId(user);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(() => parseQueryFromSearch(location.search));
  const [reportState, setReportState] = useState({ postId: "", reason: "" });
  const [openReportPostId, setOpenReportPostId] = useState("");
  const [buyingPostId, setBuyingPostId] = useState("");
  const [cartingPostId, setCartingPostId] = useState("");

  const formatter = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.search) params.search = query.search;
      if (query.category) params.category = query.category;
      if (query.status) params.status = query.status;
      const res = await api.get("/posts", { params });
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải bài đăng");
    } finally {
      setLoading(false);
    }
  }, [query.search, query.category, query.status]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/posts/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchCategories, fetchPosts]);

  useEffect(() => {
    setQuery((prev) => {
      const next = parseQueryFromSearch(location.search);
      if (
        prev.search === next.search &&
        prev.category === next.category &&
        prev.status === next.status
      ) {
        return prev;
      }
      return next;
    });
  }, [location.search]);

  const submitReport = async () => {
    if (!reportState.postId || !reportState.reason.trim()) {
      alert("Vui lòng nhập lý do báo cáo");
      return;
    }
    try {
      await api.post(
        "/reports",
        { postId: reportState.postId, reason: reportState.reason.trim() },
        getAuthConfig()
      );
      alert("Đã gửi báo cáo cho admin.");
      setReportState({ postId: "", reason: "" });
      setOpenReportPostId("");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể gửi báo cáo");
    }
  };

  const handleBuyPost = async (post) => {
    if (!user) {
      alert("Vui lòng đăng nhập để mua bài đăng");
      return;
    }

    const sellerId = post?.userId?._id || post?.userId;
    const isOwnPost = currentUserId && String(currentUserId) === String(sellerId);
    if (isOwnPost) {
      alert("Bạn không thể mua bài đăng của chính mình");
      return;
    }

    const numericPrice = Number(post.price || 0);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      alert("Bài đăng này chưa có giá hợp lệ để tạo giao dịch");
      return;
    }

    if (!window.confirm(`Xác nhận mua "${post.title}" với giá ${formatter.format(numericPrice)}?`)) {
      return;
    }

    setBuyingPostId(post._id);
    try {
      const res = await api.post(
        "/transactions",
        {
          type: "sale",
          amount: numericPrice,
          postId: post._id,
          paymentMethod: "manual",
          metadata: {
            flow: "simple-manual",
            note: "Thanh toán ngân hàng sẽ cập nhật sau",
          },
        },
        getAuthConfig()
      );
      alert(res.data?.message || "Đã tạo giao dịch đơn giản");
      fetchPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tạo giao dịch mua hàng");
    } finally {
      setBuyingPostId("");
    }
  };

  const handleAddToCart = async (post) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ");
      return;
    }

    const sellerId = post?.userId?._id || post?.userId;
    const isOwnPost = currentUserId && String(currentUserId) === String(sellerId);
    if (isOwnPost) {
      alert("Bạn không thể thêm bài đăng của chính mình vào giỏ");
      return;
    }

    if (post.status !== "approved") {
      alert("Sản phẩm đã bán hoặc không còn khả dụng");
      return;
    }

    setCartingPostId(post._id);
    try {
      await addToCart(post._id, 1);
      alert("Đã thêm vào giỏ hàng");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể thêm vào giỏ");
    } finally {
      setCartingPostId("");
    }
  };

  const categoryDisplay = useMemo(() => {
    const map = new Map(categories.map((cat) => [cat.name, Number(cat.count || 0)]));
    const selected = query.category;
    return {
      total: posts.length,
      selectedCount: selected ? map.get(selected) || 0 : posts.length,
      selected,
    };
  }, [categories, posts.length, query.category]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-slate-900">Bộ lọc</h2>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Tìm kiếm sản phẩm</label>
              <input
                placeholder="Nhập tên sản phẩm"
                value={query.search}
                onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
              />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">Trạng thái</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, status: "all" }))}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                    query.status === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, status: "available" }))}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                    query.status === "available" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Đang bán
                </button>
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, status: "sold" }))}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                    query.status === "sold" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Đã bán
                </button>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Danh mục</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, category: "" }))}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    query.category === "" ? "bg-emerald-50 font-semibold text-emerald-700" : "hover:bg-slate-100"
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span className="text-xs text-slate-500">{categoryDisplay.total}</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setQuery((prev) => ({ ...prev, category: cat.name }))}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      query.category === cat.name
                        ? "bg-emerald-50 font-semibold text-emerald-700"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <span>{toVietnameseDisplay(cat.name)}</span>
                    <span className="text-xs text-slate-500">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchPosts}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Áp dụng bộ lọc
            </button>
          </aside>

          <section className="min-w-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Chợ đồ cũ</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {categoryDisplay.selected
                      ? `Danh mục: ${toVietnameseDisplay(categoryDisplay.selected)} (${categoryDisplay.selectedCount} sản phẩm)`
                      : `Tổng cộng ${posts.length} sản phẩm`}
                  </p>
                </div>
                {query.category && (
                  <button
                    onClick={() => setQuery((prev) => ({ ...prev, category: "" }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Xóa lọc danh mục
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Đang tải...</div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Không có bài đăng.</div>
              ) : (
                posts.map((post) => {
                  const sellerId = post?.userId?._id || post?.userId;
                  const ownPost = currentUserId && String(currentUserId) === String(sellerId);
                  return (
                    <article key={post._id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      {user && !ownPost && (
                        <div className="absolute right-3 top-3 z-20">
                          <button
                            onClick={() => {
                              const nextOpen = openReportPostId === post._id ? "" : post._id;
                              setOpenReportPostId(nextOpen);
                              if (nextOpen) {
                                setReportState({ postId: post._id, reason: "" });
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow"
                            title="Báo cáo bài đăng"
                          >
                            <AlertTriangle size={14} /> Cảnh báo
                          </button>

                          {openReportPostId === post._id && (
                            <div className="mt-2 w-64 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-lg">
                              <p className="text-xs font-semibold text-amber-800">Báo cáo bài đăng</p>
                              <input
                                value={reportState.postId === post._id ? reportState.reason : ""}
                                onChange={(e) => setReportState({ postId: post._id, reason: e.target.value })}
                                placeholder="Lý do báo cáo"
                                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
                              />
                              <button
                                onClick={submitReport}
                                className="w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
                              >
                                Gửi báo cáo
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <Link to={`/posts/${post._id}`}>
                          <img
                            src={toImageUrl(post.images)}
                            alt={post.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                        </Link>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          {toVietnameseDisplay(post.category || "khác")}
                          </p>
                          {post.status === "sold" ? (
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-bold uppercase text-slate-700">
                              Đã bán
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold uppercase text-emerald-700">
                              Đang bán
                            </span>
                          )}
                        </div>

                        <Link to={`/posts/${post._id}`} className="mt-2 block text-lg font-bold text-slate-900 hover:text-emerald-700">
                          {toVietnameseDisplay(post.title)}
                        </Link>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{toVietnameseDisplay(post.description)}</p>
                        <p className="mt-3 text-xl font-black text-slate-900">
                          {formatter.format(Number(post.price || 0))}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                        {(post.tags || []).map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">#{tag}</span>
                        ))}
                        </div>

                        {!ownPost && post.status === "approved" ? (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAddToCart(post)}
                              disabled={cartingPostId === post._id}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {cartingPostId === post._id ? "Đang thêm..." : "Thêm giỏ"}
                            </button>
                            <button
                              onClick={() => handleBuyPost(post)}
                              disabled={buyingPostId === post._id}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {buyingPostId === post._id ? "Đang tạo giao dịch..." : "Mua ngay"}
                            </button>
                          </div>
                        ) : ownPost ? (
                          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-600">
                            Đây là bài đăng của bạn
                          </div>
                        ) : (
                          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-600">
                            Bài đăng đã bán
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Posts;