import axios from 'axios';

// 1. Tạo một instance của Axios với cấu hình mặc định
const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Link gốc của Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Can thiệp vào GÓI TIN GỬI ĐI (Request Interceptor)
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token từ Local Storage
        const token = localStorage.getItem('token');
        
        // Nếu có token, tự động đính kèm vào Header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Can thiệp vào GÓI TIN TRẢ VỀ (Response Interceptor)
axiosClient.interceptors.response.use(
    (response) => {
        // Thành công: Chỉ lấy phần data cho gọn, bỏ qua các thông tin HTTP rườm rà
        return response.data;
    },
    (error) => {
        // Xử lý lỗi tập trung: Nếu Backend báo lỗi 401 (Hết hạn Token hoặc Token sai)
        if (error.response && error.response.status === 401) {
            console.error('Token hết hạn hoặc không hợp lệ. Đang đăng xuất...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Tự động đẩy người dùng về trang chủ hoặc trang đăng nhập
            window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default axiosClient;