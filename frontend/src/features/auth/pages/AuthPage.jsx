import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm import useNavigate
import axiosClient from '../../../services/axiosClient';

const AuthPage = () => {
    const navigate = useNavigate(); // 2. Khởi tạo navigate
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', phone: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // Thêm loading để khóa nút bấm

    // Xử lý khi gõ vào ô input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý khi bấm nút Submit (Đăng nhập / Đăng ký)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('⏳ Đang xử lý...');
        setLoading(true);
        
        // Vì bạn dùng axiosClient, nên bạn chỉ cần truyền đường dẫn tương đối (bỏ chữ http://localhost:5000/api đi)
        const url = isLogin ? '/auth/login' : '/auth/register';

        try {
            // axiosClient đã cấu hình tự lấy response.data
            const response = await axiosClient.post(url, formData);
            
            // Nếu đăng nhập thành công
            if (isLogin && response.token) {
                // Lưu token và thông tin user vào Local Storage
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                setMessage(`✅ Đăng nhập thành công! Đang chuyển hướng...`);
                
                // 3. ĐIỀU HƯỚNG THÔNG MINH DỰA VÀO ROLE
                setTimeout(() => {
                    // Nếu tài khoản có quyền admin -> Đi tới Dashboard
                    if (response.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        // Nếu là khách hàng -> Về trang chủ mua Tour
                        navigate('/');
                    }
                }, 1000); // Đợi 1 giây để người dùng đọc được chữ "Thành công"
                
            } else {
                // Xử lý khi Đăng ký thành công
                setMessage(`✅ ${response.message}`);
                setIsLogin(true); // Đăng ký xong tự động chuyển về tab Đăng nhập
            }
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input type="text" name="full_name" placeholder="Họ và tên" onChange={handleChange} required disabled={loading}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" />
                            <input type="text" name="phone" placeholder="Số điện thoại" onChange={handleChange} disabled={loading}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" />
                        </>
                    )}
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required disabled={loading}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" />
                    <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required disabled={loading}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100" />
                    
                    <button type="submit" disabled={loading} className={`w-full text-white py-2 rounded-md transition font-bold ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {loading ? '⏳ Đang xử lý...' : (isLogin ? '🔑 Đăng Nhập' : '📝 Đăng Ký')}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 text-center rounded-md text-sm font-medium border ${message.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' : message.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {message}
                    </div>
                )}

                <p className="text-center text-sm text-gray-600 mt-4">
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} disabled={loading} className="text-blue-600 hover:underline font-bold">
                        {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;