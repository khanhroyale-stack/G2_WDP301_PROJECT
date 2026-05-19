import React from "react";
import { LayoutDashboard, Heart, MessageSquare, LogOut, Users, Flag, CreditCard, PackageCheck, ListTree } from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-slate-900 text-white p-6 flex flex-col min-h-screen sticky top-0">
      <h1 className="text-2xl font-black mb-10 flex items-center gap-2">
        <LayoutDashboard className="text-emerald-500" /> Quản trị
      </h1>
      
      <nav className="space-y-2 flex-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "overview" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <LayoutDashboard size={20} /> Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("charity")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "charity" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <Heart size={20} /> Từ thiện
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "post" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <MessageSquare size={20} /> Bài đăng
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "users" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <Users size={20} /> Người dùng
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "reports" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <Flag size={20} /> Báo cáo
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "transactions" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <CreditCard size={20} /> Giao dịch
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "orders" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <PackageCheck size={20} /> Đơn hàng
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === "categories" ? "bg-emerald-600" : "hover:bg-slate-800"
          }`}
        >
          <ListTree size={20} /> Danh mục
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 text-slate-400 hover:text-red-400 font-medium px-4 py-3 transition border-t border-slate-800 pt-6"
      >
        <LogOut size={20} /> Đăng xuất
      </button>
    </div>
  );
}
