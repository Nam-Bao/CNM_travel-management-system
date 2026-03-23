import React, { useState, useEffect } from "react";
import axios from "axios";

const ReviewForm = ({ tourId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Lấy thông tin user hiện tại để dùng cho việc lọc đánh giá
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/${tourId}`);
      const fetchedReviews = res.data.data || [];
      setReviews(fetchedReviews);
      return fetchedReviews;
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
      return [];
    }
  };

  const checkReviewEligibility = async (fetchedReviews) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    const hasReviewed = fetchedReviews.some(
      (rev) => 
        rev.user?._id === currentUser._id || 
        rev.user === currentUser._id || 
        rev.user?._id === currentUser.id
    );

    if (hasReviewed) {
      setCanReview(false);
      return; 
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/bookings/my-bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const myBookings = res.data?.data || [];
      const bookedThisTour = myBookings.find(
        (b) => b.tour?._id === tourId || b.tour === tourId
      );

      if (bookedThisTour) {
        const startDate = new Date(bookedThisTour.tour?.start_date);
        const today = new Date();
        if (startDate <= today) {
          setCanReview(true); 
        }
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền đánh giá:", error);
    }
  };

  useEffect(() => {
    if (tourId) {
      fetchReviews().then((fetchedReviews) => {
        checkReviewEligibility(fetchedReviews);
      });
    }
  }, [tourId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/reviews`,
        { tourId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("🎉 Cảm ơn bạn đã để lại đánh giá!");
      setComment("");
      setCanReview(false); 
      fetchReviews(); 
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi khi gửi đánh giá";
      alert(errorMsg);
      if (errorMsg.toLowerCase().includes("đã đánh giá") || errorMsg.toLowerCase().includes("already")) {
        setCanReview(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ BƯỚC LỌC ĐÁNH GIÁ: Chỉ giữ lại những đánh giá của User đang đăng nhập
  const myReviews = reviews.filter((rev) => {
    const reviewerId = rev.user?._id || rev.user;
    const currentUserId = currentUser?._id || currentUser?.id;
    return reviewerId === currentUserId;
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border mt-8">
      <h2 className="text-2xl font-bold mb-6">Đánh giá chuyến đi của bạn</h2>

      {/* Form Đánh giá */}
      {canReview ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-xl">
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`text-2xl ${rating >= num ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="w-full p-3 border rounded-lg text-sm mb-3 outline-none focus:border-blue-500"
            rows="3"
            required
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:bg-gray-400"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center text-gray-500 italic text-sm">
          Cảm ơn bạn đã tham gia chuyến đi. Đánh giá của bạn đã được ghi nhận!
        </div>
      )}

      {/* Danh sách Comment - Đã sử dụng mảng myReviews thay vì reviews */}
      <div className="space-y-4">
        {myReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Bạn chưa có đánh giá nào cho chuyến đi này.</p>
        ) : (
          myReviews.map((rev) => (
            <div key={rev._id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-bold text-sm">
                    {rev.user?.full_name || rev.user?.username || "Bạn"}
                  </p>
                  <div className="text-yellow-400 text-xs">
                    {"★".repeat(rev.rating)}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewForm;