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
        return axiosClient.post(url, data); 
    },

    deleteTour: (id) => {
        const url = `/tours/${id}`;
        return axiosClient.delete(url);
    }
};

export default tourApi;