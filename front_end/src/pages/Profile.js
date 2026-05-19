import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    role: "",
    status: "",
    postCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me", getAuthConfig());
      setProfile((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(
        "/auth/me",
        {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        },
        getAuthConfig()
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Cập nhật hồ sơ thành công");
      fetchMe();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black">Hồ sơ của tôi</h2>
          {loading ? (
            <p className="mt-4 text-slate-500">Đang tải...</p>
          ) : (
            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tên tài khoản</label>
                  <input value={profile.username || ""} disabled className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input value={profile.email || ""} disabled className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3" />
                </div>
              </div>

              <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Họ và tên</label>
                <input
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>
              <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Số điện thoại</label>
                <input
                  value={profile.phone || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>
              <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Địa chỉ</label>
                <input
                  value={profile.address || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Vai trò</p>
                  <p className="font-bold">{profile.role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Trạng thái</p>
                  <p className="font-bold">{profile.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Số bài đăng</p>
                  <p className="font-bold">{profile.postCount || 0}</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/addresses" className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Địa chỉ giao hàng
                </Link>
                <Link to="/orders" className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Đơn hàng
                </Link>
                <Link to="/favorites" className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Yêu thích
                </Link>
                <Link to="/reviews" className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Đánh giá
                </Link>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              >
                {saving ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
