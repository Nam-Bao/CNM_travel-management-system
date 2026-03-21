import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import tourApi from "../api/tourApi";
import BookingForm from "../../bookings/components/BookingForm";
//import ReviewForm from "../../reviews/components/ReviewForm";

const TourDetailPage = () => {
  const { slug } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await tourApi.getTourBySlug(slug);
        setTour(response);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin chi tiết tour này.");
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [slug]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl text-gray-500">
        Đang tải thông tin chuyến đi...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-500 text-xl">{error}</div>
    );

  if (!tour)
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy tour.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link to="/" className="text-3xl font-bold text-blue-600">
            Travel<span className="text-orange-500">Go</span>
          </Link>
          <Link to="/" className="text-gray-600">
            ← Trang chủ
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <h1 className="text-4xl font-bold mb-6">{tour.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* IMAGE */}
            <div className="rounded-xl overflow-hidden h-96">
              <img
                src={
                  tour.image_url || "https://placehold.co/800x400?text=No+Image"
                }
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="flex gap-4 bg-white p-4 rounded shadow">
              <div>⏱️ {tour.duration}</div>
              <div>
                📅 {new Date(tour.start_date).toLocaleDateString("vi-VN")}
              </div>
              <div>
                👥 {tour.available_seats}/{tour.max_seats}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">Mô tả</h2>
              <p>{tour.description}</p>
            </div>

            {/* ✅ REVIEW FORM (ĐÚNG VỊ TRÍ) */}
            {/* <ReviewForm tourId={tour._id} /> */}
          </div>

          {/* RIGHT */}
          <div>
            <div className="sticky top-8 bg-white p-6 rounded shadow">
              <div className="text-2xl font-bold text-red-500 mb-4">
                {formatPrice(tour.price)} / khách
              </div>

              {/* BOOKING */}
              <BookingForm tourId={tour._id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TourDetailPage;
