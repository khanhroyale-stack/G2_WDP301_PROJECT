import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Heart,
  MapPin,
  MessageCircleMore,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserRound,
} from "lucide-react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";
import { addToCart } from "../utils/cart";
import { toVietnameseDisplay } from "../utils/vietnameseText";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80";

const toImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const normalized = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

const statusClass = {
  approved: "bg-emerald-100 text-emerald-700",
  sold: "bg-slate-200 text-slate-700",
};

const statusLabels = {
  approved: "Đã duyệt",
  sold: "Đã bán",
};

const conditionLabels = {
  newLike: "Như mới",
  good: "Tốt",
  fair: "Đã qua sử dụng",
};

const shippingLabels = {
  pickup: "Nhận tại chỗ",
  delivery: "Giao hàng",
  both: "Giao hàng hoặc nhận tại chỗ",
};

const formatLocation = (post) => {
  const district = toVietnameseDisplay(String(post?.locationDistrict || "").trim());
  const city = toVietnameseDisplay(String(post?.locationCity || "").trim());
  if (!district && !city) return "Chưa cập nhật";
  if (district && city) return `${district}, ${city}`;
  return district || city;
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const currentUserId = getUserId(user);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [buying, setBuying] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [relatedPosts, setRelatedPosts] = useState([]);

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
      setActiveImage(0);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải chi tiết bài đăng");
      navigate("/posts");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      if (!user || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const res = await api.get("/favorites", getAuthConfig());
        const list = Array.isArray(res.data) ? res.data : [];
        const matched = list.some((fav) => String(fav.postId?._id || fav.postId) === String(id));
        setIsFavorite(matched);
      } catch {
        setIsFavorite(false);
      }
    };

    loadFavoriteState();
  }, [id, user]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!post?._id) {
        setRelatedPosts([]);
        return;
      }

      try {
        const params = { status: "available" };
        if (post.category) {
          params.category = post.category;
        }

        const res = await api.get("/posts", { params });
        const list = Array.isArray(res.data) ? res.data : [];
        const normalized = list
          .filter((item) => String(item._id) !== String(post._id))
          .slice(0, 8);
        setRelatedPosts(normalized);
      } catch {
        setRelatedPosts([]);
      }
    };

    fetchRelatedPosts();
  }, [post]);

  const images = Array.isArray(post?.images) && post.images.length > 0 ? post.images : [""];
  const currentImage = toImageUrl(images[activeImage] || "");
  const sellerId = post?.userId?._id || post?.userId;
  const ownPost = Boolean(currentUserId && sellerId && String(sellerId) === String(currentUserId));

  const handleBuy = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để mua bài đăng");
      navigate("/login");
      return;
    }

    if (ownPost) {
      alert("Bạn không thể mua bài đăng của chính mình");
      return;
    }

    if (!post || post.status !== "approved") {
      alert("Bài đăng này không còn khả dụng để mua");
      return;
    }

    const amount = Number(post.price || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Giá bài đăng không hợp lệ");
      return;
    }

    if (!window.confirm(`Xác nhận mua "${toVietnameseDisplay(post.title)}" với giá ${money.format(amount)}?`)) {
      return;
    }

    setBuying(true);
    try {
      const res = await api.post(
        "/transactions",
        {
          type: "sale",
          amount,
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
      fetchDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể mua bài đăng này");
    } finally {
      setBuying(false);
    }
  };

  const handleReport = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để báo cáo bài đăng");
      return;
    }
    if (!reportReason.trim()) {
      alert("Vui lòng nhập lý do báo cáo");
      return;
    }

    try {
      await api.post(
        "/reports",
        { postId: post._id, reason: reportReason.trim() },
        getAuthConfig()
      );
      setReportReason("");
      alert("Đã gửi báo cáo tới admin");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể gửi báo cáo");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ");
      navigate("/login");
      return;
    }

    if (ownPost) {
      alert("Bạn không thể thêm bài đăng của chính mình vào giỏ");
      return;
    }

    if (!post || post.status !== "approved") {
      alert("Bài đăng này không còn khả dụng");
      return;
    }

    setAddingCart(true);
    try {
      await addToCart(post._id);
      alert("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể thêm vào giỏ");
    } finally {
      setAddingCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng danh sách yêu thích");
      navigate("/login");
      return;
    }

    if (ownPost) {
      alert("Bạn không thể tự yêu thích bài đăng của mình");
      return;
    }

    setFavoriting(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${post._id}`, getAuthConfig());
        setIsFavorite(false);
      } else {
        await api.post("/favorites", { postId: post._id }, getAuthConfig());
        setIsFavorite(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật yêu thích");
    } finally {
      setFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-10 text-slate-500">Đang tải...</div>
      </div>
    );
  }

  if (!post) return null;

  const postedDate = post?.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật";
  const sellerName = toVietnameseDisplay(post.userId?.full_name || post.userId?.username || "Người bán");
  const sellerInitial = sellerName.trim().charAt(0).toUpperCase() || "S";
  const highlightRows = [
    { label: "Danh mục", value: toVietnameseDisplay(post.category || "Khác") },
    {
      label: "Phí vận chuyển",
      value: post.isFreeShip ? "Miễn phí vận chuyển" : money.format(Number(post.shippingFee || 0)),
    },
    { label: "Hình thức giao", value: shippingLabels[post.shippingType] || "Chưa cập nhật" },
    { label: "Tình trạng", value: conditionLabels[post.condition] || "Chưa cập nhật" },
    { label: "Thương hiệu", value: post.brand || "Chưa cập nhật" },
    { label: "Màu sắc", value: post.color || "Chưa cập nhật" },
    { label: "Kích cỡ", value: post.size || "Chưa cập nhật" },
    { label: "Khu vực", value: formatLocation(post) },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-8">
        <Link
          to="/posts"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          &larr; Quay lại chợ đồ cũ
        </Link>

        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div>
                  <div className="overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={currentImage}
                      alt={toVietnameseDisplay(post.title)}
                      className="aspect-[4/3] w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                    {images.map((image, idx) => (
                      <button
                        key={`${post._id}-${idx}`}
                        onClick={() => setActiveImage(idx)}
                        className={`overflow-hidden rounded-xl border bg-white ${
                          activeImage === idx ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"
                        }`}
                      >
                        <img
                          src={toImageUrl(image)}
                          alt={`thumb-${idx}`}
                          className="h-14 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays size={15} /> Đăng ngày: <span className="font-semibold text-slate-800">{postedDate}</span>
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <MapPin size={15} /> {formatLocation(post)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-3xl font-black leading-snug text-slate-900">{toVietnameseDisplay(post.title)}</h1>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        statusClass[post.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[post.status] || post.status}
                    </span>
                  </div>

                  <p className="mt-3 text-4xl font-black text-orange-600">{money.format(Number(post.price || 0))}</p>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                      <Truck size={15} /> Vận chuyển: {shippingLabels[post.shippingType] || "Chưa cập nhật"}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2">
                      <CircleDollarSign size={15} />
                      {post.isFreeShip
                        ? "Miễn phí vận chuyển"
                        : `Phí vận chuyển: ${money.format(Number(post.shippingFee || 0))}`}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2">
                      <Package size={15} /> Tình trạng: {conditionLabels[post.condition] || "Chưa cập nhật"}
                    </p>
                  </div>

                  {!ownPost && post.status === "approved" ? (
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingCart}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-300 px-4 py-3.5 font-semibold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShoppingCart size={18} /> {addingCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                      </button>
                      <button
                        onClick={handleBuy}
                        disabled={buying}
                        className="rounded-2xl bg-orange-500 px-4 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {buying ? "Đang xử lý..." : "Mua ngay"}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <p className="inline-flex items-center gap-2">
                      <ShieldCheck size={15} className="text-emerald-600" />
                      Cam kết nhận đúng mô tả hoặc được hỗ trợ xử lý.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <p>Bạn có sản phẩm tương tự?</p>
                    <Link to="/create-post" className="font-semibold text-orange-600 hover:text-orange-700">Đăng bán</Link>
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriting || ownPost}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-600 disabled:opacity-60"
                    >
                      <Heart size={16} /> {isFavorite ? "Bỏ thích" : "Yêu thích"}
                    </button>
                  </div>

                  {post.status === "sold" ? (
                    <div className="mt-4 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Bài đăng này đã bán
                    </div>
                  ) : null}

                  {ownPost ? (
                    <Link
                      to="/my-posts"
                      className="mt-4 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Quản lý bài đăng của bạn
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">Thông tin người bán</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-black text-orange-700">
                    {sellerInitial}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{sellerName}</p>
                    <p className="mt-1 text-sm text-slate-600">@{post.userId?.username || "user"}</p>
                    <p className="mt-1 text-sm text-slate-600">SĐT: {post.userId?.phone || "Chưa công khai"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-200 px-3 py-2">
                    <ShieldCheck size={16} className="mx-auto text-emerald-600" />
                    <p className="mt-1 font-semibold text-slate-800">Đáng tin cậy</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-3 py-2">
                    <BadgeCheck size={16} className="mx-auto text-sky-600" />
                    <p className="mt-1 font-semibold text-slate-800">Phản hồi tốt</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">Thông tin nổi bật</h2>
              <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200">
                {highlightRows.map((row) => (
                  <div key={row.label} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[180px_1fr] sm:items-center">
                    <p className="font-semibold text-slate-600">{row.label}</p>
                    <p className="font-medium text-slate-800">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">Mô tả sản phẩm</h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">{toVietnameseDisplay(post.description) || "Người bán chưa cập nhật mô tả."}</p>

              {(post.tags || []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(post.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-slate-900">Hỏi đáp</h2>
                <button className="rounded-2xl border border-orange-400 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                  + Hỏi ngay
                </button>
              </div>
              <p className="mt-3 text-slate-600">Hỏi người bán để biết thêm thông tin sản phẩm trước khi giao dịch.</p>
            </div>

            {!ownPost && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-sm font-bold text-amber-800">Báo cáo bài đăng</h3>
                <input
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Lý do báo cáo"
                  className="mt-3 w-full border border-amber-300 bg-white px-3 py-2 text-sm"
                />
                <button
                  onClick={handleReport}
                  className="mt-3 w-full rounded-2xl bg-amber-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Gửi báo cáo
                </button>
              </div>
            )}

            {relatedPosts.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-slate-900">Sản phẩm khác tương tự</h2>
                  <Link to="/posts" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {relatedPosts.slice(0, 4).map((item) => (
                    <Link
                      key={item._id}
                      to={`/posts/${item._id}`}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <img
                        src={toImageUrl(Array.isArray(item.images) ? item.images[0] : "")}
                        alt={toVietnameseDisplay(item.title)}
                        className="h-36 w-full object-cover"
                      />
                      <div className="p-3">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-800">{toVietnameseDisplay(item.title)}</p>
                        <p className="mt-2 font-black text-orange-600">{money.format(Number(item.price || 0))}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={13} /> {formatLocation(item)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900">Có thể bạn sẽ thích</h3>
              <div className="mt-3 space-y-3">
                {relatedPosts.slice(0, 5).map((item) => (
                  <Link
                    key={`side-${item._id}`}
                    to={`/posts/${item._id}`}
                    className="block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <img
                      src={toImageUrl(Array.isArray(item.images) ? item.images[0] : "")}
                      alt={toVietnameseDisplay(item.title)}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">{toVietnameseDisplay(item.title)}</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{money.format(Number(item.price || 0))}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} /> {formatLocation(item)}
                      </p>
                    </div>
                  </Link>
                ))}

                {relatedPosts.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                    Chưa có gợi ý phù hợp.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p className="inline-flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                Luôn ưu tiên trao đổi rõ ràng với người bán trước khi chốt đơn.
              </p>
              <p className="mt-3 inline-flex items-start gap-2">
                <MessageCircleMore size={16} className="mt-0.5 shrink-0 text-sky-600" />
                Cần thêm ảnh hoặc video thực tế, hãy dùng mục Hỏi đáp để yêu cầu.
              </p>
              <p className="mt-3 inline-flex items-start gap-2">
                <UserRound size={16} className="mt-0.5 shrink-0 text-orange-500" />
                Ưu tiên giao dịch trực tiếp ở nơi an toàn khi có thể.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
