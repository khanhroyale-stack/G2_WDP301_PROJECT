import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  House,
  ShoppingBag,
  SquarePen,
  ReceiptText,
  Package,
  Heart,
  ShoppingCart,
  HandHeart,
  MapPinned,
  UserRound,
  Shield,
} from "lucide-react";
import { fetchCartCount, onCartUpdated } from "../utils/cart";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserId = user?.id || user?._id || "";
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!currentUserId) {
      setCartCount(0);
      return;
    }

    let mounted = true;
    const loadCount = async () => {
      try {
        const count = await fetchCartCount();
        if (mounted) {
          setCartCount(count);
        }
      } catch {
        if (mounted) {
          setCartCount(0);
        }
      }
    };

    loadCount();
    const off = onCartUpdated(loadCount);
    return () => {
      mounted = false;
      off();
    };
  }, [currentUserId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Trang chủ", icon: House, private: false },
    { to: "/posts", label: "Chợ đồ cũ", icon: ShoppingBag, private: false },
    { to: "/my-posts", label: "Bài đăng của tôi", icon: SquarePen, private: true },
    { to: "/transactions", label: "Giao dịch", icon: ReceiptText, private: true },
    { to: "/orders", label: "Đơn hàng", icon: Package, private: true },
    { to: "/favorites", label: "Yêu thích", icon: Heart, private: true },
    { to: "/cart", label: "Giỏ hàng", icon: ShoppingCart, private: true },
    { to: "/charities", label: "Từ thiện", icon: HandHeart, private: false, accent: true },
    { to: "/addresses", label: "Địa chỉ", icon: MapPinned, private: true },
    { to: "/profile", label: "Hồ sơ", icon: UserRound, private: true },
    { to: "/admin", label: "Quản trị", icon: Shield, private: true, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
            GL
          </div>
          <div>
            <p className="text-lg font-bold">GreenLoop</p>
            <p className="text-xs text-slate-500">
              Nền tảng bán, đổi đồ cũ và hỗ trợ các hoạt động từ thiện.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/posts"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Chợ đồ cũ
          </Link>
          {user && (
            <Link
              to="/my-posts"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Bài Đăng Của Tôi
            </Link>
          )}
          {user && (
            <Link
              to="/transactions"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Giao Dịch
            </Link>
          )}
          <Link
            to="/charities"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Từ thiện
          </Link>
          {user && (
            <Link
              to="/profile"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Hồ Sơ
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-slate-900 hover:text-emerald-600"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                Chào, {user.full_name || user.username}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium md:block"
              >
                Đăng nhập
              </Link>
              <Link
                to="/create-post"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
              >
                Bán đồ ngay
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <nav className="flex items-center gap-2 overflow-x-auto pb-1">
            {navItems
              .filter((item) => !item.private || user)
              .filter((item) => !item.adminOnly || user?.role === "admin")
              .map((item) => {
                const Icon = item.icon;
                const isActive = item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : item.accent
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                    {item.to === "/cart" && user && cartCount > 0 && (
                      <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-white text-slate-900" : "bg-emerald-600 text-white"}`}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>
    </header>
  );
}
