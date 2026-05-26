import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
  });
  const [step, setStep] = useState(1); // 1: Đăng ký, 2: Nhập OTP
  const [otp, setOtp] = useState("");
  const [resendingOtp, setResendingOtp] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/auth/register", formData);
      alert("Mã xác nhận đã được gửi về email!");
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đăng ký");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/auth/verify-account", {
        email: formData.email,
        otp,
      });
      alert("Xác nhận thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "OTP sai hoặc hết hạn");
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) {
      alert("Vui lòng nhập email trước");
      return;
    }

    setResendingOtp(true);
    try {
      await axios.post("http://localhost:8000/api/auth/resend-verify-otp", {
        email: formData.email,
      });
      alert("Đã gửi lại OTP. Vui lòng kiểm tra email.");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể gửi lại OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-10">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full ring-1 ring-slate-200">
        <h2 className="text-3xl font-black text-center mb-6">
          {step === 1 ? "Đăng ký" : "Xác nhận email"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="username"
              placeholder="Tên tài khoản"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
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
            <input
              type="text"
              name="full_name"
              placeholder="Họ và tên"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Đăng ký
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-center text-sm text-slate-600 mb-4">
              Vui lòng nhập mã 6 chữ số được gửi tới {formData.email}
            </p>
            <input
              type="text"
              maxLength="6"
              placeholder="Mã OTP"
              required
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 text-center text-xl tracking-widest rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
            >
              Xác nhận
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendingOtp}
              className="w-full border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition disabled:opacity-60"
            >
              {resendingOtp ? "Đang gửi lại OTP..." : "Gửi lại OTP"}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
