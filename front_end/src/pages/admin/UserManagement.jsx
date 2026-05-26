import { useCallback, useEffect, useState } from "react";
import api, { getAuthConfig } from "../../utils/api";

const statusLabels = {
  active: "Hoạt động",
  banned: "Bị khóa",
  unverified: "Chưa xác thực",
};

const roleLabels = {
  admin: "Quản trị",
  user: "Người dùng",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "", role: "" });

  const fetchUsers = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.role) params.role = currentFilters.role;

      const res = await api.get("/admin/users", { params, ...getAuthConfig() });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status }, getAuthConfig());
      fetchUsers(filters);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật trạng thái người dùng");
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Quản lý người dùng</h2>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tổng tài khoản</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Đang hoạt động</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">{users.filter((u) => u.status === "active").length}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs uppercase tracking-wide text-rose-700">Đã bị khóa</p>
          <p className="mt-1 text-2xl font-black text-rose-700">{users.filter((u) => u.status === "banned").length}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_140px_120px]">
        <input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Tìm theo tên tài khoản/email"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">hoạt động</option>
          <option value="banned">bị khóa</option>
          <option value="unverified">chưa xác thực</option>
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả vai trò</option>
          <option value="admin">quản trị</option>
          <option value="user">người dùng</option>
        </select>
        <button onClick={fetchUsers} className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white">Lọc</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Số bài đăng</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-5 text-slate-500">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-5 text-slate-500">Không có người dùng.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{u.full_name || u.username}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">{roleLabels[u.role] || u.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">{statusLabels[u.status] || u.status}</span>
                  </td>
                  <td className="px-4 py-3">{u.postCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {u.status === "banned" ? (
                        <button onClick={() => setStatus(u._id, "active")} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                          Mở khóa
                        </button>
                      ) : (
                        <button onClick={() => setStatus(u._id, "banned")} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                          Khóa
                        </button>
                      )}
                      {u.status !== "unverified" && (
                        <button onClick={() => setStatus(u._id, "unverified")} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                          Hủy xác thực
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
