import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import CharityManagement from "./CharityManagement";
import PostManagement from "./PostManagement";
import AdminStats from "./AdminStats";
import UserManagement from "./UserManagement";
import ReportManagement from "./ReportManagement";
import TransactionManagement from "./TransactionManagement";
import OrderManagement from "./OrderManagement";
import CategoryManagement from "./CategoryManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Giao diện Sidebar đã được tách riêng */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "overview" && <AdminStats />}
        {activeTab === "charity" && <CharityManagement />}
        {activeTab === "post" && <PostManagement />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "reports" && <ReportManagement />}
        {activeTab === "transactions" && <TransactionManagement />}
        {activeTab === "orders" && <OrderManagement />}
        {activeTab === "categories" && <CategoryManagement />}
      </main>
    </div>
  );
}
