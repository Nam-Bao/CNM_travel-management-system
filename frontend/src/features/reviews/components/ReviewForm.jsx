import React, { useState, useEffect } from "react";
import axios from "axios";

const ReviewForm = ({ tourId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);

  // Lấy danh sách comment
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reviews/${tourId}`,
      );
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    }
  };

  // Kiểm tra quyền đánh giá (Đã đặt tour + Tour đã đi qua ngày khởi hành)
  const checkReviewEligibility = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Dùng API lấy lịch sử booking của user (giả sử bạn có route này)
      const res = await axios.get(
        `http://localhost:5000/api/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const myBookings = res.data?.data || [];
      const bookedThisTour = myBookings.find(
        (b) => b.tour?._id === tourId || b.tour === tourId,
      );

      if (bookedThisTour) {
        const startDate = new Date(bookedThisTour.tour?.start_date);
        const today = new Date();
        if (startDate <= today) {
          setCanReview(true); // Được đánh giá
        }
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền đánh giá:", error);
    }
  };

  useEffect(() => {
    if (tourId) {
      fetchReviews();
      checkReviewEligibility();
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("🎉 Cảm ơn bạn đã để lại đánh giá!");
      setComment("");
      fetchReviews(); // Tải lại danh sách
      setCanReview(false); // Ẩn form vì bạn check "1 người 1 review" ở backend
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border mt-8">
      <h2 className="text-2xl font-bold mb-6">Đánh giá chuyến đi</h2>

      {/* Form Đánh giá (chỉ hiện khi đủ điều kiện) */}
      {canReview ? (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-gray-50 p-4 rounded-xl"
        >
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center text-gray-500 italic text-sm">
          Bạn chỉ có thể viết đánh giá sau khi đã tham gia chuyến đi này.
        </div>
      )}

      {/* Danh sách Comment */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa có đánh giá nào.</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-bold text-sm">
                    {rev.user?.full_name || rev.user?.username || "Khách hàng"}
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
