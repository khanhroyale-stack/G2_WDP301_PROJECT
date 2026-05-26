import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api, { getAuthConfig } from "../utils/api";
import { getStoredUser, getUserId } from "../utils/auth";

const renderStars = (rating) => {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
};

export default function Reviews() {
  const user = getStoredUser();
  const currentUserId = getUserId(user);

  const [myReviews, setMyReviews] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const avgRating = useMemo(() => {
    if (sellerReviews.length === 0) return 0;
    const total = sellerReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / sellerReviews.length).toFixed(1);
  }, [sellerReviews]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const calls = [api.get("/reviews/me", getAuthConfig())];
      if (currentUserId) {
        calls.push(api.get(`/reviews/seller/${currentUserId}`));
      }

      const [myRes, sellerRes] = await Promise.all(calls);
      setMyReviews(Array.isArray(myRes.data) ? myRes.data : []);
      setSellerReviews(Array.isArray(sellerRes?.data) ? sellerRes.data : []);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900">Đánh giá</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi đánh giá bạn đã gửi và đánh giá người khác gửi cho bạn.</p>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Đang tải đánh giá...</div>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Đánh giá tôi nhận được</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {sellerReviews.length} đánh giá • {avgRating} sao
                </span>
              </div>

              {sellerReviews.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Bạn chưa nhận đánh giá nào.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sellerReviews.map((review) => (
                    <article key={review._id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          {review.reviewerId?.full_name || review.reviewerId?.username || "Người dùng"}
                        </p>
                        <p className="text-sm font-bold text-amber-700">{renderStars(Number(review.rating || 0))}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{review.comment || "Không có nhận xét"}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-black text-slate-900">Đánh giá tôi đã gửi</h3>

              {myReviews.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Bạn chưa gửi đánh giá nào.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {myReviews.map((review) => (
                    <article key={review._id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          Người bán: {review.sellerId?.full_name || review.sellerId?.username || "Ẩn danh"}
                        </p>
                        <p className="text-sm font-bold text-amber-700">{renderStars(Number(review.rating || 0))}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{review.comment || "Không có nhận xét"}</p>
                      <p className="mt-2 text-xs text-slate-500">Đơn hàng: {review.orderId?._id || review.orderId || "-"}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
