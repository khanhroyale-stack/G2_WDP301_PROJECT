import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";

const emptyForm = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  street: "",
  note: "",
  isDefault: false,
};

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const addressCount = useMemo(() => addresses.length, [addresses.length]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/addresses", getAuthConfig());
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form, getAuthConfig());
      } else {
        await api.post("/addresses", form, getAuthConfig());
      }
      resetForm();
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
      street: addr.street || "",
      note: addr.note || "",
      isDefault: Boolean(addr.isDefault),
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await api.delete(`/addresses/${id}`, getAuthConfig());
      if (editingId === id) {
        resetForm();
      }
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa địa chỉ");
    }
  };

  const onSetDefault = async (addr) => {
    if (addr.isDefault) return;
    try {
      await api.put(`/addresses/${addr._id}`, { isDefault: true }, getAuthConfig());
      fetchAddresses();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể đặt địa chỉ mặc định");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">
              {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Quản lý địa chỉ giao nhận để checkout nhanh hơn.</p>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Họ và tên người nhận"
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                />
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Số điện thoại"
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  value={form.province}
                  onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                  placeholder="Tỉnh/Thành"
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                />
                <input
                  required
                  value={form.district}
                  onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder="Quận/Huyện"
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                />
                <input
                  required
                  value={form.ward}
                  onChange={(e) => setForm((prev) => ({ ...prev, ward: e.target.value }))}
                  placeholder="Phường/Xã"
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                />
              </div>

              <input
                required
                value={form.street}
                onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                placeholder="Số nhà, tên đường"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />

              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Ghi chú giao hàng (không bắt buộc)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                />
                Đặt làm địa chỉ mặc định
              </label>

              <div className="flex gap-2">
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm địa chỉ"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700"
                  >
                    Hủy
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Địa chỉ của tôi</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {addressCount} địa chỉ
              </span>
            </div>

            {loading ? (
              <p className="mt-4 text-slate-500">Đang tải địa chỉ...</p>
            ) : addresses.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
                Bạn chưa có địa chỉ nào.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((addr) => (
                  <article key={addr._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{addr.fullName} - {addr.phone}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                        </p>
                        {addr.note ? <p className="mt-1 text-xs text-slate-500">Ghi chú: {addr.note}</p> : null}
                      </div>
                      {addr.isDefault ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                          Mặc định
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => onSetDefault(addr)}
                          className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                        >
                          Đặt mặc định
                        </button>
                      ) : null}
                      <button
                        onClick={() => onEdit(addr)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(addr._id)}
                        className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
