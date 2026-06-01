import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"; 
import tourApi from "../api/tourApi";
import BookingForm from "../../bookings/components/BookingForm";

const TourDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hứng dữ liệu từ trang chọn ghế trả về

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    const fetchTourDetail = async () => {
      try {
        const response = await tourApi.getTourBySlug(slug);
        const tourData = response.data || response;
        setTour(tourData);
        setMainImage(
          tourData.images?.[0] ||
            tourData.image_url ||
            "https://placehold.co/800x500"
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTourDetail();
  }, [slug]);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p || 0);

  if (loading)
    return (
      <div className="p-20 text-center font-black text-blue-600 animate-pulse text-2xl">
        ĐANG TẢI...
      </div>
    );
  if (!tour)
    return (
      <div className="p-20 text-center text-red-500 font-bold">
        Tour không tồn tại!
      </div>
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-12 animate-fadeIn">
            {/* <section>
              <h2 className="text-xl font-black text-blue-800 border-l-4 border-blue-600 pl-3 mb-6 uppercase italic tracking-tighter">
                Thông tin về bảo hiểm du lịch
              </h2>
              <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-5">
                <div className="border-b pb-4">
                  <h3 className="font-black text-gray-800 uppercase text-sm">
                    Chi tiết thông tin bảo hiểm du lịch
                  </h3>
                </div>
                <div className="text-[13px] text-gray-600 leading-[1.8] space-y-5 text-justify font-medium">
                  <p>
                    Công ty TNHH Một Thành Viên Dịch vụ Lữ hành{" "}
                    <strong className="text-blue-700">Traveloke</strong> thực
                    hiện chương trình
                    <strong className="text-gray-900">
                      {" "}
                      TẶNG MIỄN PHÍ BẢO HIỂM DU LỊCH NƯỚC NGOÀI{" "}
                    </strong>
                    dành cho tất cả du khách tham gia tour trọn gói trên tất cả
                    các tuyến du lịch nước ngoài, khởi hành trên toàn quốc, với
                    mức bảo hiểm tối đa{" "}
                    <span className="font-black text-blue-800 underline">
                      lên đến 1.200.000.000 VNĐ/khách/vụ
                    </span>
                    .
                  </p>
                  <p>
                    Riêng các tuyến Châu Âu, Châu Mỹ, Châu Phi, Châu Úc, Nhật
                    Bản và Các tiểu Vương Quốc Ả Rập Thống Nhất, mức bảo hiểm
                    tối đa{" "}
                    <span className="font-black text-orange-600 underline">
                      lên đến 2.400.000.000 VNĐ/khách/vụ
                    </span>
                    .
                  </p>
                  <div>
                    Toàn bộ phí bảo hiểm được tặng miễn phí cho khách hàng của
                    Lữ hành Traveloke với chương trình, giá và chất lượng dịch
                    vụ tour không đổi.
                  </div>
                  <p className="text-gray-400 text-[12px]">
                    Thông tin chi tiết, vui lòng liên hệ các văn phòng thuộc Hệ
                    thống Lữ hành Traveloke trên toàn quốc.
                  </p>
                </div>
              </div>
            </section> */}

            <section>
              <h2 className="text-xl font-black text-blue-800 border-l-4 border-blue-600 pl-3 mb-6 uppercase italic tracking-tighter">
                Hình ảnh điểm đến
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tour.images?.map((img, index) => (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-2xl shadow-md border-2 border-white hover:border-blue-500 transition-all duration-300 cursor-pointer group ${index === 0 ? "col-span-2 row-span-2" : "col-span-1"}`}
                    onClick={() => {
                      setMainImage(img);
                      window.scrollTo({ top: 150, behavior: "smooth" });
                    }}
                  >
                    <img
                      src={img}
                      alt="Gallery"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-blue-800 border-l-4 border-blue-600 pl-3 mb-6 uppercase italic tracking-tighter">
                Tour này có gì hấp dẫn
              </h2>
              <div className="text-[13px] text-gray-600 leading-[1.8] text-justify whitespace-pre-line border-l-2 border-gray-200 pl-6 italic font-medium">
                {tour.description}
              </div>
            </section>
          </div>
        );
      case "itinerary":
        return (
          <div className="space-y-8 animate-fadeIn ml-4">
            <h2 className="text-xl font-black text-blue-800 border-l-4 border-blue-600 pl-3 mb-10 uppercase italic tracking-tighter">
              Hành trình du lịch
            </h2>
            {tour.itinerary?.map((item, idx) => (
              <div key={idx} className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-black shadow-lg">
                    D{idx + 1}
                  </div>
                  {idx !== tour.itinerary.length - 1 && (
                    <div className="w-1 h-full bg-blue-100 mt-2"></div>
                  )}
                </div>
                <div className="pb-12 flex-1">
                  <h3 className="font-black text-gray-800 uppercase mb-3 text-lg italic tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      case "cancellation":
        return (
          <div className="bg-gray-50 min-h-screen py-16 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 text-center tracking-tight">
                🔒 Chính Sách Bảo Mật & Hoàn Hủy
              </h1>

              <div className="space-y-8 text-gray-700 leading-relaxed">
                {/* Section 1 */}
                <section>
                  <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">A. Chính Sách Bảo Mật Thông Tin</h2>
                  <p className="mb-3">Tại Traveloke, việc bảo vệ dữ liệu cá nhân của bạn là ưu tiên hàng đầu.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Mục đích thu thập:</strong> Chúng tôi chỉ thu thập các thông tin cần thiết (Họ tên, Số điện thoại, Email) thông qua biểu mẫu đặt tour để phục vụ cho việc giữ chỗ và phát hành Vé điện tử.</li>
                    <li><strong>Sử dụng thông tin:</strong> Email của bạn được sử dụng duy nhất để hệ thống tự động gửi Xác nhận đơn hàng và Vé điện tử. Số điện thoại dùng để hướng dẫn viên liên hệ trước giờ khởi hành.</li>
                    <li><strong>Bảo mật dữ liệu:</strong> Toàn bộ thông tin cá nhân và lịch sử giao dịch của bạn được mã hóa và lưu trữ an toàn. Chúng tôi cam kết không bán, chia sẻ hay trao đổi dữ liệu cho bất kỳ bên thứ ba nào.</li>
                  </ul>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">B. Chính Sách Hoàn/Hủy Tour</h2>
                  <p className="mb-3">Chúng tôi hiểu rằng kế hoạch của bạn có thể thay đổi. Hệ thống Traveloke áp dụng chính sách hoàn hủy tự động và minh bạch ngay trên trang "Lịch sử chuyến đi":</p>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-4">
                    <ul className="space-y-3 font-medium">
                      <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 30 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 100% số tiền</span></li>
                      <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 20 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 50% số tiền</span></li>
                      <li className="flex justify-between border-b border-blue-200 pb-2"><span>Hủy trước 15 ngày:</span> <span className="text-blue-700 font-bold">Hoàn 20% số tiền</span></li>
                      <li className="flex justify-between text-red-600"><span>Hủy sát ngày (dưới 15 ngày):</span> <span className="font-bold">KHÔNG hoàn tiền</span></li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    * Lưu ý: Thời gian hủy được hệ thống tính toán tự động dựa trên thời điểm bạn nhấn nút "Yêu cầu Hủy Tour". Số tiền hoàn lại sẽ được chuyển trả vào tài khoản của quý khách trong vòng 3-5 ngày làm việc.
                  </p>
                </section>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 flex flex-col">
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative overflow-hidden rounded-[40px] shadow-2xl border-8 border-white">
              <img
                src={mainImage}
                className="w-full h-[500px] object-cover"
                alt="Main"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white right-10">
                <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                  {tour.title}
                </h1>
              </div>
            </div>

            <div className="flex bg-white rounded-2xl shadow-sm border p-1.5 sticky top-24 z-40 overflow-x-auto no-scrollbar">
              {[
                { id: "overview", label: "Tổng quan" },
                { id: "itinerary", label: "Hành trình du lịch" },
                { id: "cancellation", label: "Chính sách hủy / phạt" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-8 py-4 text-[11px] font-black uppercase tracking-tighter rounded-xl transition-all duration-300 whitespace-nowrap
                        ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {" "}
                  {tab.label}{" "}
                </button>
              ))}
            </div>

            <div className="bg-white p-10 shadow-xl rounded-[32px] border border-gray-100 min-h-[600px]">
              {renderTabContent()}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl border-t-[12px] border-orange-500 sticky top-24">
              <h3 className="text-lg font-black text-gray-800 mb-8 text-center border-b pb-4 uppercase italic tracking-widest">
                Bảng giá vé trọn gói
              </h3>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border">
                  <div>
                    <p className="font-bold text-gray-700 uppercase text-[10px]">
                      Người lớn
                    </p>
                    <p className="text-[10px] text-gray-400 italic font-medium">
                      Trên 12 tuổi
                    </p>
                  </div>
                  <p className="text-xl font-black text-blue-700">
                    {formatPrice(tour.price?.adult)}
                  </p>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border">
                  <div>
                    <p className="font-bold text-gray-700 uppercase text-[10px]">
                      Trẻ em
                    </p>
                    <p className="text-[10px] text-gray-400 italic font-medium">
                      Từ 2 - 12 tuổi
                    </p>
                  </div>
                  <p className="text-xl font-black text-gray-800">
                    {formatPrice(tour.price?.child)}
                  </p>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 p-4 rounded-2xl border border-green-100">
                  <div>
                    <p className="font-bold text-green-700 uppercase text-[10px]">
                      Em bé
                    </p>
                    <p className="text-[10px] text-gray-400 italic font-medium">
                      Dưới 2 tuổi
                    </p>
                  </div>
                  <p className="text-xl font-black text-green-600">
                    {tour.price?.infant > 0
                      ? formatPrice(tour.price.infant)
                      : "Miễn phí"}
                  </p>
                </div>
              </div>
              
              {/* QUAN TRỌNG NHẤT LÀ DÒNG NÀY: Truyền dữ liệu xuống BookingForm */}
              <BookingForm tour={tour} savedData={location.state?.returnedData} />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TourDetailPage;