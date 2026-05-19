
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        formData,
      );
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Đăng nhập thành công!");
      const userRole = String(user?.role || "").toLowerCase();
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      alert(
        "Lỗi đăng nhập: " + (error.response?.data?.message || "Sai thông tin"),
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full ring-1 ring-slate-200">
        <h2 className="text-3xl font-black text-center mb-6">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email của bạn"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition"
          >
            Đăng nhập
          </button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link
            to="/forgot-password"
            className="text-slate-600 hover:text-emerald-600 font-medium"
          >
            Quên mật khẩu?
          </Link>
          <Link
            to="/register"
            className="text-emerald-600 font-bold hover:underline"
          >
            Tạo tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
