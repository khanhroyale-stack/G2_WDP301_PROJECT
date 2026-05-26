import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, totalGoal: 0, activeCampaigns: 0, totalCampaigns: 0 });
  const [loading, setLoading] = useState(true);
  const statusLabels = { active: 'Đang hoạt động', closed: 'Đã đóng' };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, charitiesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/charities/stats'),
        axios.get('http://localhost:8000/api/charities')
      ]);
      setStats(statsRes.data);
      setCharities(charitiesRes.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  const progressPercentage = stats.totalGoal > 0 ? Math.min(100, Math.round((stats.totalDonated / stats.totalGoal) * 100)) : 0;
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Chiến dịch từ thiện</h1>
            <p className="mt-2 text-lg text-gray-600">Cùng chung tay tạo ra giá trị tích cực cho cộng đồng.</p>
          </div>
          {isAdmin && (
            <Link
              to="/create-charity"
              className="mt-6 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              Tạo chiến dịch
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 transform transition-all hover:-translate-y-1 duration-300">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-emerald-500 mr-2 text-3xl">🌿</span> Tác động cộng đồng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Tổng đã quyên góp</p>
                <p className="mt-2 text-4xl font-extrabold text-emerald-600">{stats.totalDonated.toLocaleString()} VND</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Chiến dịch đang hoạt động</p>
                <p className="mt-2 text-4xl font-extrabold text-blue-600">{stats.activeCampaigns} <span className="text-lg text-blue-400 font-medium">/ {stats.totalCampaigns}</span></p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <p className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Tiến độ mục tiêu</p>
                <p className="mt-2 text-4xl font-extrabold text-purple-600">{progressPercentage}%</p>
                <div className="w-full bg-purple-200 rounded-full h-2.5 mt-4">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Khám phá chiến dịch</h2>
        {charities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">Chưa có chiến dịch nào. Hãy là người đầu tiên tạo chiến dịch!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {charities.map((charity) => {
              const pct = charity.goalAmount > 0 ? Math.min(100, Math.round(((charity.currentAmount || 0) / charity.goalAmount) * 100)) : 0;
              return (
                <div key={charity._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 pr-2">{charity.title}</h3>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${charity.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[charity.status] || charity.status}
                      </span>
                    </div>
                    <p className="text-base text-gray-600 mb-4 line-clamp-3">{charity.shortDescription || charity.description}</p>
                    {charity.highlightMessage && (
                      <div className="bg-amber-50 rounded text-amber-800 text-sm p-3 mb-4 italic border-l-4 border-amber-400">
                        "{charity.highlightMessage}"
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-600">Đã gây quỹ <span className="text-emerald-600 font-bold">{(charity.currentAmount || 0).toLocaleString()} VND</span></span>
                      <span className="text-gray-500">/ {(charity.goalAmount || 0).toLocaleString()} VND</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                    <Link 
                      to={`/charity/${charity._id}`} 
                      className="w-full text-center block bg-white border-2 border-emerald-500 text-emerald-600 py-2.5 px-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Quyên góp ngay và xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Charities;
