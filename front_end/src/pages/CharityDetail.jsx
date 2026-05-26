import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const CharityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ charity: null, donations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [donationForm, setDonationForm] = useState({
    donorName: '',
    amount: '',
    message: ''
  });
  const [donating, setDonating] = useState(false);
  const [donateError, setDonateError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchCharityDetail();
  }, [id]);

  const fetchCharityDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/charities/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDonateChange = (e) => {
    setDonationForm({ ...donationForm, [e.target.name]: e.target.value });
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setDonating(true);
    setDonateError(null);
    setSuccessMsg(null);

    if (!donationForm.amount || isNaN(donationForm.amount) || Number(donationForm.amount) <= 0) {
      setDonateError('Vui lòng nhập số tiền hợp lệ.');
      setDonating(false);
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8000/api/charities/${id}/donate`, donationForm);
      
      setSuccessMsg('Cảm ơn bạn đã đóng góp!');
      setDonationForm({ donorName: '', amount: '', message: '' });
      fetchCharityDetail();
    } catch (err) {
      setDonateError(err.response?.data?.message || err.message);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !data.charity) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy</h2>
          <p className="text-slate-600 mb-6">{error || "Chiến dịch này không tồn tại hoặc đã bị xóa."}</p>
          <Link to="/" className="inline-block bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-700 transition">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const { charity, donations } = data;
  const pct = charity.goalAmount > 0 ? Math.min(100, Math.round(((charity.currentAmount || 0) / charity.goalAmount) * 100)) : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8 transition">
            <span className="mr-2">←</span> Trở về trang chủ
          </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white relative">
                <span className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${charity.status === 'active' ? 'bg-white/20 text-white' : 'bg-slate-800/50 text-slate-300'}`}>
                  {charity.status === 'active' ? 'Đang diễn ra' : 'Đã đóng'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black mb-4 pr-20 leading-tight">
                  {charity.title}
                </h1>
                {charity.highlightMessage && (
                  <p className="text-lg text-emerald-50 font-medium italic border-l-4 border-emerald-300 pl-4 py-1">
                    "{charity.highlightMessage}"
                  </p>
                )}
              </div>
              
              <div className="p-8">
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Đã quyên góp</p>
                      <p className="text-3xl font-black text-emerald-600 mt-1">
                        {Number(charity.currentAmount || 0).toLocaleString()} <span className="text-xl text-emerald-600/70 font-bold">VNĐ</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Mục tiêu</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">
                        {Number(charity.goalAmount || 0).toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                    <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-right text-sm font-bold text-emerald-700">{pct}% hoàn thành</p>
                </div>

                <div className="prose prose-slate max-w-none mb-10 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Về chiến dịch này</h3>
                  {charity.description}
                </div>

                {/* Donation Form */}
                {charity.status === 'active' && (
                  <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 border border-emerald-100 italic transition-all">
                    <h3 className="text-2xl font-black text-emerald-800 mb-6">Đóng góp ngay lúc này</h3>
                    
                    {!user ? (
                      <div className="text-center py-8">
                        <p className="text-slate-600 mb-6">Vui lòng đăng nhập để thực hiện quyên góp cho chiến dịch này.</p>
                        <Link to="/login" className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition inline-block">
                          Đăng nhập ngay
                        </Link>
                      </div>
                    ) : (
                      <>
                        {successMsg && (
                          <div className="mb-6 p-4 bg-emerald-100/50 border border-emerald-200 rounded-xl text-emerald-800 font-medium flex items-center">
                            <span className="text-2xl mr-3">🎉</span> {successMsg}
                          </div>
                        )}
                        
                        {donateError && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-sm flex items-start">
                            <span className="mr-2">⚠️</span> {donateError}
                          </div>
                        )}

                        <form onSubmit={handleDonateSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-bold text-emerald-900 mb-2">Tên hiển thị (Tùy chọn)</label>
                              <input 
                                type="text" 
                                name="donorName"
                                value={donationForm.donorName}
                                onChange={handleDonateChange}
                                placeholder="Tên của bạn..." 
                                className="w-full px-4 py-3 rounded-xl border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow shadow-sm not-italic"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-emerald-900 mb-2">Số tiền đóng góp (VNĐ) <span className="text-red-500">*</span></label>
                              <input 
                                type="number" 
                                name="amount"
                                required
                                min="1000"
                                value={donationForm.amount}
                                onChange={handleDonateChange}
                                placeholder="VD: 50000" 
                                className="w-full px-4 py-3 rounded-xl border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow shadow-sm font-bold text-emerald-700 not-italic"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Lời nhắn gửi (Tùy chọn)</label>
                            <textarea 
                              rows="3" 
                              name="message"
                              value={donationForm.message}
                              onChange={handleDonateChange}
                              placeholder="Chia sẻ vài lời tới dự án..."
                              className="w-full px-4 py-3 rounded-xl border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow shadow-sm resize-none not-italic"
                            ></textarea>
                          </div>
                          <button 
                            type="submit" 
                            disabled={donating}
                            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-200 transition-all ${donating ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1'}`}
                          >
                            {donating ? 'Đang xử lý...' : 'Xác nhận Quyên Góp'}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Donations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Người đóng góp</h3>
                <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">{donations.length} lượt</span>
              </div>
              
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {donations.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3 opacity-50">💌</div>
                    <p className="text-slate-500 text-sm">Chưa có lượt đóng góp nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  donations.map((d) => (
                    <div key={d._id} className="relative pl-4 border-l-2 border-emerald-100 py-1 hover:border-emerald-400 transition-colors">
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-emerald-400"></div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800">{d.donorName}</span>
                        <span className="font-black text-emerald-600 text-sm">{Number(d.amount).toLocaleString()}đ</span>
                      </div>
                      {d.message && (
                        <p className="text-slate-600 text-sm italic bg-slate-50 p-2 rounded-lg mt-2 inline-block">"{d.message}"</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
                        {new Date(d.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </div>
    </>
  );
};

export default CharityDetail;
