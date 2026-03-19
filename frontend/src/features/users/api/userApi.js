// Đường dẫn này tùy thuộc vào vị trí file axiosClient của bạn (thường để ở src/api/axiosClient.js)
// Bạn có thể copy cách import từ file tourApi.js qua cho chính xác!
import axiosClient from '../../../services/axiosClient';

const userApi = {
    getAllUsers: () => {
        const url = '/users';
        return axiosClient.get(url);
    },
    // Hàm đổi quyền (PUT)
    updateUserRole: (id, role) => {
        const url = `/users/${id}/role`;
        return axiosClient.put(url, { role });
    },


    toggleUserStatus: (id) => {
        const url = `/users/${id}/status`;
        return axiosClient.put(url); // Không cần gửi data, backend tự đảo trạng thái
    }
};

export default userApi;