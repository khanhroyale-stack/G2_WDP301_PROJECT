import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2 } from "lucide-react";

const statusLabels = {
  active: "Đang hoạt động",
  closed: "Đã đóng",
};

export default function CharityManagement() {
  const [charities, setCharities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", goalAmount: "", status: "active" });

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/charities");
      setCharities(res.data);
    } catch (err) {
      console.error("Error fetching charities", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharity) {
        await axios.put(`http://localhost:8000/api/charities/${editingCharity._id}`, form, config);
      } else {
        await axios.post("http://localhost:8000/api/charities", form, config);
      }
      setShowModal(false);
      setEditingCharity(null);
      setForm({ title: "", description: "", goalAmount: "", status: "active" });
      fetchCharities();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này?")) {
      try {
        await axios.delete(`http://localhost:8000/api/charities/${id}`, config);
        fetchCharities();
      } catch (err) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Quản lý chiến dịch từ thiện</h2>
        <button
          onClick={() => {
            setEditingCharity(null);
            setForm({ title: "", description: "", goalAmount: "", status: "active" });
            setShowModal(true);
          }}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
        >
          <Plus size={20} /> Thêm chiến dịch
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <th className="px-6 py-4">Tiêu đề</th>
              <th className="px-6 py-4">Mục tiêu</th>
              <th className="px-6 py-4">Đã quyên góp</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {charities.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">{c.title}</td>
                <td className="px-6 py-4">{Number(c.goalAmount).toLocaleString()}đ</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{Number(c.currentAmount).toLocaleString()}đ</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingCharity(c);
                      setForm({ title: c.title, description: c.description, goalAmount: c.goalAmount, status: c.status || "active" });
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-6">{editingCharity ? "Sửa chiến dịch" : "Thêm chiến dịch mới"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả</label>
                <textarea
                  required
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mục tiêu (VNĐ)</label>
                <input
                  required
                  type="number"
                  value={form.goalAmount}
                  onChange={(e) => setForm({ ...form, goalAmount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="active">đang hoạt động</option>
                  <option value="closed">đã đóng</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
