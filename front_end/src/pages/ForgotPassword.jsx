import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/auth/forgot-password", {
        email,
      });
      setStep(2);
      alert("Đã gửi mã khôi phục về email của bạn.");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi email");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đặt lại mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full ring-1 ring-slate-200">
        <h2 className="text-3xl font-black text-center mb-6">Quên mật khẩu</h2>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Gửi mã xác nhận
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              maxLength="6"
              placeholder="Mã OTP 6 số"
              required
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 text-center tracking-widest rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              required
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
            >
              Xác nhận đổi mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
