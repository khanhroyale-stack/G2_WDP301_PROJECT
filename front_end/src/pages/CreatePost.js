import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  CircleHelp,
  ImagePlus,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Trash2,
} from "lucide-react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";

const CONDITION_OPTIONS = [
  {
    value: "newLike",
    label: "Như mới",
    description: "Ít hoặc chưa qua sử dụng, ngoại hình đẹp.",
  },
  {
    value: "good",
    label: "Tốt",
    description: "Đã qua sử dụng, hoạt động ổn định, có thể có vết xước nhẹ.",
  },
  {
    value: "fair",
    label: "Trung bình",
    description: "Đã qua sử dụng nhiều, có hao mòn rõ rệt nhưng vẫn dùng được.",
  },
];

const SHIPPING_OPTIONS = [
  { value: "pickup", label: "Nhận tại chỗ" },
  { value: "delivery", label: "Chỉ giao hàng" },
  { value: "both", label: "Cả hai" },
];

const MAX_TITLE = 90;
const MAX_DESC = 2000;

function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    condition: "good",
    brand: "",
    color: "",
    size: "",
    shippingType: "both",
    shippingFee: "0",
    isFreeShip: false,
    isFreeProduct: false,
    locationCity: "",
    locationDistrict: "",
    pickupAddressId: "",
    tags: "",
  });
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  useEffect(() => {
    const nextPreviewUrls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);

      try {
        const [categoriesRes, addressesRes] = await Promise.all([
          api.get("/categories", { params: { activeOnly: "true" } }),
          api.get("/addresses", getAuthConfig()),
        ]);

        const categoryList = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        const addressList = Array.isArray(addressesRes.data) ? addressesRes.data : [];
        setCategories(categoryList);
        setAddresses(addressList);

        const defaultAddress = addressList.find((item) => item.isDefault) || addressList[0];
        if (defaultAddress) {
          setForm((prev) => ({
            ...prev,
            pickupAddressId: String(defaultAddress._id || ""),
            locationCity: prev.locationCity || defaultAddress.province || "",
            locationDistrict: prev.locationDistrict || defaultAddress.district || "",
          }));
        }
      } catch (error) {
        alert(error.response?.data?.message || "Không thể tải dữ liệu danh mục/địa chỉ");
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
  }, []);

  const parsedTags = useMemo(() => {
    return [...new Set(form.tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  }, [form.tags]);

  const titleCount = form.title.trim().length;
  const descCount = form.description.trim().length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    if (form.isFreeShip) {
      setForm((prev) => ({ ...prev, shippingFee: "0" }));
    }
  }, [form.isFreeShip]);

  useEffect(() => {
    if (form.isFreeProduct) {
      setForm((prev) => ({ ...prev, price: "0" }));
    }
  }, [form.isFreeProduct]);

  useEffect(() => {
    if (!form.pickupAddressId) return;
    const selected = addresses.find((item) => String(item._id) === String(form.pickupAddressId));
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      locationCity: selected.province || prev.locationCity,
      locationDistrict: selected.district || prev.locationDistrict,
    }));
  }, [addresses, form.pickupAddressId]);

  const handlePickImages = (e) => {
    const picked = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...picked].slice(0, 8));
  };

  const removeImageAt = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!agreePolicy) {
      alert("Vui lòng xác nhận chính sách trước khi đăng bán");
      return;
    }

    if (images.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh");
      return;
    }

    if (!form.categoryId) {
      alert("Vui lòng chọn danh mục sản phẩm");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.isFreeProduct ? "0" : form.price || "0");
      formData.append("categoryId", form.categoryId);
      formData.append("condition", form.condition);
      formData.append("brand", form.brand.trim());
      formData.append("color", form.color.trim());
      formData.append("size", form.size.trim());
      formData.append("shippingType", form.shippingType);
      formData.append("shippingFee", form.isFreeShip ? "0" : form.shippingFee || "0");
      formData.append("isFreeShip", String(Boolean(form.isFreeShip)));
      formData.append("locationCity", form.locationCity.trim());
      formData.append("locationDistrict", form.locationDistrict.trim());

      if (parsedTags.length > 0) formData.append("tags", JSON.stringify(parsedTags));

      for (const file of images) {
        formData.append("images", file);
      }

      const authConfig = getAuthConfig();
      await api.post("/posts", formData, {
        ...authConfig,
        headers: {
          ...authConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Bài đăng đã được tạo và đang chờ admin duyệt.");
      navigate("/my-posts");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tạo bài đăng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <h1 className="text-4xl font-black text-slate-900">Đăng bán</h1>
          <p className="mt-2 text-slate-600">
            Mô tả sản phẩm trung thực và đầy đủ để tăng tỷ lệ duyệt nhanh và bán nhanh hơn.
          </p>

          <div className="mt-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Chỉ còn 1 bước nữa</span>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                <ImagePlus size={18} /> Ảnh sản phẩm <span className="text-rose-500">*</span>
              </p>
              <label className="mt-4 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:bg-slate-100">
                <Camera size={34} className="text-slate-400" />
                <p className="mt-3 font-semibold text-slate-700">Tải lên ảnh sản phẩm</p>
                <p className="mt-1 text-sm text-slate-500">Tối đa 8 ảnh, ưu tiên ảnh thật rõ mặt trước/sau và chi tiết lỗi.</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePickImages}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                  {previewUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img src={url} alt={`preview-${index}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageAt(index)}
                        className="absolute right-1 top-1 rounded-lg bg-white/95 p-1 text-rose-600 shadow"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                <Package size={18} /> Thông tin sản phẩm
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Danh mục <span className="text-rose-500">*</span></label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    disabled={loadingMeta}
                    className="w-full px-4 py-3 disabled:opacity-60"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tên sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="title"
                    required
                    maxLength={MAX_TITLE}
                    minLength={5}
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: iPhone 12 64GB màu đen, pin 85%"
                    className="w-full px-4 py-3"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">{titleCount}/{MAX_TITLE}</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Tình trạng <span className="text-rose-500">*</span></label>
                <div className="grid gap-3 md:grid-cols-3">
                  {CONDITION_OPTIONS.map((option) => {
                    const active = form.condition === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, condition: option.value }))}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <p className="font-bold text-slate-900">{option.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mô tả sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="7"
                    required
                    maxLength={MAX_DESC}
                    minLength={10}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả chi tiết..."
                    className="w-full px-4 py-3"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">{descCount}/{MAX_DESC}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="inline-flex items-center gap-2 font-bold text-slate-900">
                    <CircleHelp size={15} /> Gợi ý mô tả nên có
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    <li>Loại sản phẩm, thương hiệu, xuất xứ</li>
                    <li>Tình trạng sử dụng thực tế, lỗi nếu có</li>
                    <li>Phụ kiện đi kèm và chính sách đổi trả (nếu có)</li>
                    <li>Kích thước, màu sắc, thông số liên quan</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black text-slate-900">Giá và thông tin khác</h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Giá bán (VND) <span className="text-rose-500">*</span></label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    required
                    disabled={form.isFreeProduct}
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Tối thiểu 0"
                    className="w-full px-4 py-3 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      name="isFreeProduct"
                      type="checkbox"
                      checked={form.isFreeProduct}
                      onChange={handleChange}
                    />
                    Sản phẩm miễn phí
                  </label>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Thương hiệu</label>
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="Apple, Samsung..."
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Màu sắc</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Đen, Trắng, Xám..."
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Kích thước/Size</label>
                  <input
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="S/M/L, 13 inch..."
                    className="w-full px-4 py-3"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Thẻ mô tả</label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Ví dụ: laptop, sinh viên, giá rẻ"
                  className="w-full px-4 py-3"
                />
                <p className="mt-2 text-xs text-slate-500">Ngăn cách mỗi thẻ bằng dấu phẩy. Tối đa 10 thẻ.</p>
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

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="inline-flex items-center gap-2 text-lg font-black text-slate-900">
                <Truck size={18} /> Vận chuyển và lấy hàng
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Địa chỉ lấy hàng</label>
                  <select
                    name="pickupAddressId"
                    value={form.pickupAddressId}
                    onChange={handleChange}
                    disabled={loadingMeta || addresses.length === 0}
                    className="w-full px-4 py-3 disabled:opacity-60"
                  >
                    <option value="">Chọn địa chỉ</option>
                    {addresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.fullName} - {addr.street}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Hình thức giao</label>
                  <select
                    name="shippingType"
                    value={form.shippingType}
                    onChange={handleChange}
                    className="w-full px-4 py-3"
                  >
                    {SHIPPING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phí vận chuyển (VND)</label>
                  <input
                    name="shippingFee"
                    type="number"
                    min="0"
                    value={form.shippingFee}
                    onChange={handleChange}
                    disabled={form.isFreeShip}
                    className="w-full px-4 py-3 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    name="isFreeShip"
                    type="checkbox"
                    checked={form.isFreeShip}
                    onChange={handleChange}
                  />
                  Miễn phí vận chuyển
                </label>

                <Link to="/addresses" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  + Thêm/chỉnh sửa địa chỉ
                </Link>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <MapPin size={15} className="mr-1 inline" /> Thành phố
                  </label>
                  <input
                    name="locationCity"
                    value={form.locationCity}
                    onChange={handleChange}
                    placeholder="Ví dụ: Hà Nội"
                    className="w-full px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Quận/Huyện</label>
                  <input
                    name="locationDistrict"
                    value={form.locationDistrict}
                    onChange={handleChange}
                    placeholder="Ví dụ: Cầu Giấy"
                    className="w-full px-4 py-3"
                  />
                </div>
              </div>

              {addresses.length === 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Bạn chưa có địa chỉ lấy hàng. Hãy thêm địa chỉ để người mua dễ giao dịch hơn.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={(e) => setAgreePolicy(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Tôi đồng ý đăng thông tin trung thực và tuân thủ chính sách đăng bán của hệ thống.
                </span>
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/my-posts"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Quay lại
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  <ShieldCheck size={16} />
                  {submitting ? "Đang gửi..." : "Đăng bán"}
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
