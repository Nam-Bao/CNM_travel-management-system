import { useState } from "react";
import axiosClient from "../../../services/axiosClient";

const ReviewForm = ({ tourId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.post("/reviews", {
        tour: tourId,
        rating,
        comment,
      });

      alert("Đánh giá thành công!");
      setComment("");
      setRating(5);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi đánh giá");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2">Đánh giá tour ⭐</h3>

      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <textarea
        placeholder="Nhận xét..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <button className="bg-green-500 text-white px-4 py-2 rounded">
        Gửi đánh giá
      </button>
    </form>
  );
};

export default ReviewForm;
