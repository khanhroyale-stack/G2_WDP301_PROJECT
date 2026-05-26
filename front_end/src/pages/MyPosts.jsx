import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, ImagePlus, Package, Truck, Trash2 } from "lucide-react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";
import { toVietnameseDisplay } from "../utils/vietnameseText";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80";

const statuses = ["all", "pending", "approved", "rejected", "sold"];
const statusLabels = {
  all: "Tất cả",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  sold: "Đã bán",
};

const CONDITION_OPTIONS = [
  { value: "newLike", label: "Như mới" },
  { value: "good", label: "Tốt" },
  { value: "fair", label: "Trung bình" },
];

const SHIPPING_OPTIONS = [
  { value: "pickup", label: "Nhận tại chỗ" },
  { value: "delivery", label: "Chỉ giao hàng" },
  { value: "both", label: "Cả hai" },
];

const MAX_TITLE = 90;
const MAX_DESC = 2000;

const toImageUrl = (images) => {
  const first = Array.isArray(images) && images.length > 0 ? images[0] : "";
  if (!first) return FALLBACK_IMAGE;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  const normalized = first.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized}`;
};

const createDraftFromPost = (post) => ({
  _id: post._id,
  title: post.title || "",
  description: post.description || "",
  price: String(post.price ?? ""),
  categoryId: String(post.categoryId || ""),
  condition: post.condition || "good",
  brand: post.brand || "",
  color: post.color || "",
  size: post.size || "",
  shippingType: post.shippingType || "both",
  shippingFee: String(post.shippingFee ?? 0),
  isFreeShip: Boolean(post.isFreeShip),
  locationCity: post.locationCity || "",
  locationDistrict: post.locationDistrict || "",
  pickupAddressId: "",
  tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
  existingImages: Array.isArray(post.images) ? post.images.filter(Boolean) : [],
  newImages: [],
});

export default function MyPosts() {
  const user = getStoredUser();
  const currentUserId = getUserId(user);

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [editItem, setEditItem] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editCategories, setEditCategories] = useState([]);
  const [editAddresses, setEditAddresses] = useState([]);
  const [editMetaLoading, setEditMetaLoading] = useState(false);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const money = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const parsedTags = useMemo(() => {
    const source = editDraft?.tagsText || "";
    return [...new Set(source.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  }, [editDraft?.tagsText]);

  useEffect(() => {
    const files = editDraft?.newImages || [];
    const urls = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [editDraft?.newImages]);

  const fetchMyPosts = async (activeFilter) => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const params = {};
      if (activeFilter !== "all") params.status = activeFilter;
      const res = await api.get("/posts/me", { params, ...getAuthConfig() });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được bài đăng của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentUserId]);

  const fetchEditMeta = async () => {
    setEditMetaLoading(true);
    try {
      const [categoriesRes, addressesRes] = await Promise.all([
        api.get("/categories", { params: { activeOnly: "true" } }),
        api.get("/addresses", getAuthConfig()),
      ]);

      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const addresses = Array.isArray(addressesRes.data) ? addressesRes.data : [];
      setEditCategories(categories);
      setEditAddresses(addresses);

      const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
      if (defaultAddress) {
        setEditDraft((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pickupAddressId: String(defaultAddress._id || ""),
            locationCity: prev.locationCity || defaultAddress.province || "",
            locationDistrict: prev.locationDistrict || defaultAddress.district || "",
          };
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh mục/địa chỉ");
    } finally {
      setEditMetaLoading(false);
    }
  };

  const openEditModal = (post) => {
    setEditItem(post);
    setEditDraft(createDraftFromPost(post));
    fetchEditMeta();
  };

  const closeEditModal = () => {
    setEditItem(null);
    setEditDraft(null);
    setEditSaving(false);
    setNewImagePreviews([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài đăng này?")) return;
    try {
      await api.delete(`/posts/${id}`, getAuthConfig());
      fetchMyPosts(filter);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa");
    }
  };

  const handleSold = async (id) => {
    try {
      await api.patch(`/posts/${id}/sold`, {}, getAuthConfig());
      fetchMyPosts(filter);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể đánh dấu đã bán");
    }
  };

  const handlePickEditImages = (e) => {
    const picked = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));
    setEditDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.newImages, ...picked].slice(0, 8);
      return { ...prev, newImages: next };
    });
  };

  const removeNewImageAt = (index) => {
    setEditDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        newImages: prev.newImages.filter((_, idx) => idx !== index),
      };
    });
  };

  const removeExistingImageAt = (index) => {
    setEditDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        existingImages: prev.existingImages.filter((_, idx) => idx !== index),
      };
    });
  };

  useEffect(() => {
    if (!editDraft?.pickupAddressId) return;
    const selected = editAddresses.find((item) => String(item._id) === String(editDraft.pickupAddressId));
    if (!selected) return;

    setEditDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        locationCity: selected.province || prev.locationCity,
        locationDistrict: selected.district || prev.locationDistrict,
      };
    });
  }, [editAddresses, editDraft?.pickupAddressId]);

  useEffect(() => {
    if (!editDraft?.isFreeShip) return;
    setEditDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, shippingFee: "0" };
    });
  }, [editDraft?.isFreeShip]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editDraft) return;

    if (!editDraft.categoryId) {
      alert("Vui lòng chọn danh mục");
      return;
    }

    if (!editDraft.title.trim() || editDraft.title.trim().length < 5) {
      alert("Tiêu đề cần ít nhất 5 ký tự");
      return;
    }

    if (!editDraft.description.trim() || editDraft.description.trim().length < 10) {
      alert("Mô tả cần ít nhất 10 ký tự");
      return;
    }

    if (editDraft.newImages.length === 0 && editDraft.existingImages.length === 0) {
      alert("Bài đăng cần ít nhất 1 ảnh");
      return;
    }

    setEditSaving(true);
    try {
      if (editDraft.newImages.length > 0) {
        const formData = new FormData();
        formData.append("title", editDraft.title.trim());
        formData.append("description", editDraft.description.trim());
        formData.append("price", String(Number(editDraft.price || 0)));
        formData.append("categoryId", editDraft.categoryId);
        formData.append("condition", editDraft.condition);
        formData.append("brand", editDraft.brand.trim());
        formData.append("color", editDraft.color.trim());
        formData.append("size", editDraft.size.trim());
        formData.append("shippingType", editDraft.shippingType);
        formData.append("shippingFee", editDraft.isFreeShip ? "0" : String(Number(editDraft.shippingFee || 0)));
        formData.append("isFreeShip", String(Boolean(editDraft.isFreeShip)));
        formData.append("locationCity", editDraft.locationCity.trim());
        formData.append("locationDistrict", editDraft.locationDistrict.trim());
        if (parsedTags.length > 0) formData.append("tags", JSON.stringify(parsedTags));

        for (const file of editDraft.newImages) {
          formData.append("images", file);
        }

        const authConfig = getAuthConfig();
        await api.put(`/posts/${editDraft._id}`, formData, {
          ...authConfig,
          headers: {
            ...authConfig.headers,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.put(
          `/posts/${editDraft._id}`,
          {
            title: editDraft.title.trim(),
            description: editDraft.description.trim(),
            price: Number(editDraft.price || 0),
            categoryId: editDraft.categoryId,
            condition: editDraft.condition,
            brand: editDraft.brand.trim(),
            color: editDraft.color.trim(),
            size: editDraft.size.trim(),
            shippingType: editDraft.shippingType,
            shippingFee: editDraft.isFreeShip ? 0 : Number(editDraft.shippingFee || 0),
            isFreeShip: Boolean(editDraft.isFreeShip),
            locationCity: editDraft.locationCity.trim(),
            locationDistrict: editDraft.locationDistrict.trim(),
            tags: parsedTags,
            images: editDraft.existingImages,
          },
          getAuthConfig()
        );
      }

      alert("Đã cập nhật bài đăng. Bài sẽ chuyển về trạng thái chờ admin duyệt lại.");
      closeEditModal();
      fetchMyPosts(filter);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật bài đăng");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black">Bài đăng của tôi</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý bài đăng và lịch sử đã bán.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  filter === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {statusLabels[status] || status}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">Chưa có bài đăng nào.</div>
          ) : (
            items.map((post) => (
              <article key={post._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[4/3] w-full bg-slate-100">
                  <Link to={`/posts/${post._id}`}>
                    <img
                      src={toImageUrl(post.images)}
                      alt={toVietnameseDisplay(post.title)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </Link>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">{toVietnameseDisplay(post.title)}</h3>
                      <p className="line-clamp-3 text-sm text-slate-600">{toVietnameseDisplay(post.description)}</p>
                      <p className="mt-2 text-lg font-black">{money.format(Number(post.price || 0))}</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                        {statusLabels[post.status] || post.status}
                      </span>
                      {post.rejectReason ? (
                        <p className="mt-2 max-w-xs text-xs text-rose-600">Lý do từ chối: {toVietnameseDisplay(post.rejectReason)}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(post)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                    >
                      Sửa
                    </button>
                    <Link
                      to={`/posts/${post._id}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      Xóa
                    </button>
                    {post.status === "approved" && (
                      <button
                        onClick={() => handleSold(post._id)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Đánh dấu đã bán
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {editItem && editDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 p-3 sm:p-6">
          <div className="mx-auto h-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-6">
            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">Cập nhật bài đăng</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Sau khi lưu, bài đăng sẽ chuyển về trạng thái chờ admin duyệt lại.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>

              <section className="rounded-2xl border border-slate-200 p-4">
                <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                  <ImagePlus size={18} /> Ảnh sản phẩm
                </p>
                <p className="mt-1 text-xs text-slate-500">Nếu tải ảnh mới, hệ thống sẽ dùng bộ ảnh mới thay cho ảnh hiện tại.</p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:bg-slate-100">
                    <Camera size={28} className="text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">Tải ảnh mới (tối đa 8)</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePickEditImages}
                      className="hidden"
                    />
                  </label>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Lưu ý</p>
                    <p className="mt-1">Giữ ít nhất 1 ảnh cho bài đăng để tăng khả năng duyệt.</p>
                  </div>
                </div>

                {editDraft.existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Ảnh hiện tại</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                      {editDraft.existingImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img src={toImageUrl([image])} alt={`existing-${index}`} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingImageAt(index)}
                            className="absolute right-1 top-1 rounded-lg bg-white/95 p-1 text-rose-600 shadow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Ảnh mới</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                      {newImagePreviews.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img src={url} alt={`new-${index}`} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImageAt(index)}
                            className="absolute right-1 top-1 rounded-lg bg-white/95 p-1 text-rose-600 shadow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                  <Package size={18} /> Thông tin sản phẩm
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Danh mục</label>
                    <select
                      value={editDraft.categoryId}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, categoryId: e.target.value }))}
                      disabled={editMetaLoading}
                      className="w-full px-4 py-3 disabled:opacity-60"
                    >
                      <option value="">Chọn danh mục</option>
                      {editCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{toVietnameseDisplay(cat.name)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Tình trạng</label>
                    <select
                      value={editDraft.condition}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-4 py-3"
                    >
                      {CONDITION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tiêu đề</label>
                  <input
                    value={editDraft.title}
                    maxLength={MAX_TITLE}
                    onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">{editDraft.title.trim().length}/{MAX_TITLE}</p>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Mô tả</label>
                  <textarea
                    value={editDraft.description}
                    rows={6}
                    maxLength={MAX_DESC}
                    onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">{editDraft.description.trim().length}/{MAX_DESC}</p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Giá bán (VND)</label>
                    <input
                      type="number"
                      min="0"
                      value={editDraft.price}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Thương hiệu</label>
                    <input
                      value={editDraft.brand}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Màu sắc</label>
                    <input
                      value={editDraft.color}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Kích thước/Size</label>
                    <input
                      value={editDraft.size}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, size: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tags</label>
                  <input
                    value={editDraft.tagsText}
                    onChange={(e) => setEditDraft((prev) => ({ ...prev, tagsText: e.target.value }))}
                    className="w-full px-4 py-3"
                    placeholder="laptop, sinh viên, giá rẻ"
                  />
                  {parsedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {parsedTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                  <Truck size={18} /> Vận chuyển và vị trí
                </p>

                <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Địa chỉ lấy hàng</label>
                    <select
                      value={editDraft.pickupAddressId}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, pickupAddressId: e.target.value }))}
                      disabled={editMetaLoading || editAddresses.length === 0}
                      className="w-full px-4 py-3 disabled:opacity-60"
                    >
                      <option value="">Chọn địa chỉ</option>
                      {editAddresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.fullName} - {addr.street}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Hình thức giao</label>
                    <select
                      value={editDraft.shippingType}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, shippingType: e.target.value }))}
                      className="w-full px-4 py-3"
                    >
                      {SHIPPING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Phí vận chuyển</label>
                    <input
                      type="number"
                      min="0"
                      value={editDraft.shippingFee}
                      disabled={editDraft.isFreeShip}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, shippingFee: e.target.value }))}
                      className="w-full px-4 py-3 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editDraft.isFreeShip}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, isFreeShip: e.target.checked }))}
                    />
                    Miễn phí vận chuyển
                  </label>
                </div>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Thành phố</label>
                    <input
                      value={editDraft.locationCity}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, locationCity: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Quận/Huyện</label>
                    <input
                      value={editDraft.locationDistrict}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, locationDistrict: e.target.value }))}
                      className="w-full px-4 py-3"
                    />
                  </div>
                </div>
              </section>

              <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {editSaving ? "Đang lưu..." : "Lưu và gửi duyệt lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
