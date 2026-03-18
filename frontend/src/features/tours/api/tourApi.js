import axiosClient from '../../../services/axiosClient';

const tourApi = {
    // Không cần gửi token (Ai cũng xem được danh sách tour)
    getAllTours: () => {
        const url = '/tours';
        return axiosClient.get(url);
    },

    // KHÔNG CẦN TỰ GẮN TOKEN! axiosClient sẽ tự làm việc đó cho bạn
    // Chức năng này sẽ bị Backend chặn lại nếu user chưa đăng nhập hoặc không phải Admin
    createTour: (data) => {
        const url = '/tours';
        return axiosClient.post(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
    },

    deleteTour: (id) => {
        const url = `/tours/${id}`;
        return axiosClient.delete(url);
    },
    // Hàm lấy thông tin chi tiết của 1 tour để đổ vào form
    getTourById: (id) => {
        const url = `/tours/${id}`;
        return axiosClient.get(url);
    },

    getTourBySlug: (slug) => {
        const url = `/tours/slug/${slug}`;
        return axiosClient.get(url);
    },

    // Hàm cập nhật tour (PUT)
    updateTour: (id, data) => {
        const url = `/tours/${id}`;
        return axiosClient.put(url, data, {
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
    }
};

export default tourApi;