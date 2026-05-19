import { useEffect, useState } from "react";
import api, { getAuthConfig } from "../../utils/api";

const emptyForm = {
  name: "",
  slug: "",
  level: 1,
  sortOrder: 0,
  icon: "",
  isActive: true,
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories", { params: { activeOnly: "false" } });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        level: Number(form.level || 1),
        sortOrder: Number(form.sortOrder || 0),
        icon: form.icon,
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload, getAuthConfig());
      } else {
        await api.post("/categories", payload, getAuthConfig());
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      level: Number(category.level || 1),
      sortOrder: Number(category.sortOrder || 0),
      icon: category.icon || "",
      isActive: Boolean(category.isActive),
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`, getAuthConfig());
      if (editingId === id) {
        resetForm();
      }
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Quản lý danh mục</h2>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold text-slate-900">{editingId ? "Sửa danh mục" : "Tạo danh mục"}</h3>

          <form onSubmit={onSubmit} className="mt-3 space-y-3">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Tên danh mục"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="Slug (có thể để trống để tự tạo)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                placeholder="Level"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                placeholder="Sort order"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <input
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="Icon (text hoặc URL)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Kích hoạt danh mục
            </label>

            <div className="flex gap-2">
              <button
                disabled={saving}
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700"
                >
                  Hủy
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold text-slate-900">Danh sách danh mục</h3>

          {loading ? (
            <p className="mt-4 text-slate-500">Đang tải danh mục...</p>
          ) : categories.length === 0 ? (
            <p className="mt-4 text-slate-500">Chưa có danh mục.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <article key={category._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{category.name}</p>
                      <p className="text-xs text-slate-500">slug: {category.slug}</p>
                      <p className="text-xs text-slate-500">
                        level: {category.level} • sort: {category.sortOrder} • {category.isActive ? "active" : "inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(category._id)}
                        className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
