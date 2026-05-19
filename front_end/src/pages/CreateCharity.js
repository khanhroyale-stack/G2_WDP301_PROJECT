import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CreateCharity = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.description) {
      setError('Tiêu đề và mô tả là bắt buộc.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        goalAmount: formData.goalAmount ? Number(formData.goalAmount) : 0,
      };

      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8000/api/charities', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        navigate('/charities');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-5xl text-center inline-block mb-4">🌱</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tạo chiến dịch mới
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Truyền cảm hứng để mọi người cùng chung tay cho một mục tiêu ý nghĩa.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Tiêu đề chiến dịch
              </label>
              <div className="mt-1">
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                  placeholder="Ví dụ: Hỗ trợ học sinh vùng cao"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">
                Mục tiêu gây quỹ (VND)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₫</span>
                </div>
                <input
                  type="number"
                  name="goalAmount"
                  id="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleChange}
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 pr-12 py-3 sm:text-sm border-gray-300 rounded-lg transition-colors duration-200"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Mô tả chi tiết
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
                  placeholder="Hãy chia sẻ câu chuyện và mục tiêu gây quỹ của bạn..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Hệ thống AI sẽ tự động tạo mô tả ngắn và thông điệp nổi bật từ phần mô tả này.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link to="/charities" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : 'Đăng chiến dịch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCharity;
