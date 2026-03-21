import axiosClient from "../../../services/axiosClient";

const reviewApi = {
  // Gửi một đánh giá mới
  createReview: (data) => {
    return axiosClient.post("/reviews", data);
  },

  // Lấy danh sách đánh giá của 1 tour cụ thể (Giả định Backend cho phép lọc qua query)
  getReviewsByTourId: (tourId) => {
    return axiosClient.get(`/reviews?tour=${tourId}`);
  },
};

export default reviewApi;
