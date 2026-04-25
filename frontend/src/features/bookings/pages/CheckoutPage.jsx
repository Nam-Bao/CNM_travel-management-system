import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bookingApi from "../api/bookingApi";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { bookingData, tour } = location.state || {};

  // State lưu thông tin ngân hàng Big4 của khách
  const [customerBank, setCustomerBank] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  if (!bookingData || !tour) {
    return (
      <div className="p-20 text-center font-black">
        <p className="text-red-500 mb-4 uppercase italic tracking-widest">
          Dữ liệu thanh toán lỗi!
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-8 py-2 rounded-full"
        >
          Trang chủ
        </button>
      </div>
    );
  }

  const handleConfirmPayment = async () => {
    if (
      !customerBank.bankName ||
      !customerBank.accountNumber ||
      !customerBank.accountName
    ) {
      return alert(
        "Vui lòng nhập đầy đủ thông tin ngân hàng để xác nhận thanh toán!",
      );
    }

    setLoading(true);
    try {
      const payload = {
        tourId: tour._id,
        guest_size: {
          adult: Number(bookingData.adult || 0),
          child: Number(bookingData.child || 0),
          infant: Number(bookingData.infant || 0),
        },
        contact_info: {
          full_name: bookingData.fullName,
          phone: bookingData.phone,
          email: bookingData.email,
        },
        total_price: Number(bookingData.total),
        // Gửi thông tin ngân hàng Big4 của khách
        payment_details: customerBank,
        payment_method: "Chuyển khoản Big4",
        // 🔥 QUAN TRỌNG NHẤT: Thêm dòng này để Admin hiện chữ "Đã thanh toán"
        status: "Đã thanh toán",
      };

      await bookingApi.createBooking(payload);
      alert(
        "🎉 Đặt tour thành công! Đơn hàng của bạn đã được chuyển sang trạng thái Đã thanh toán.",
      );
      navigate("/my-bookings");
    } catch (err) {
      alert(
        "Lỗi: " + (err.response?.data?.message || "Không thể lưu đơn hàng"),
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat("vi-VN").format(p) + " ₫";

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {/* KHỐI 1: THÔNG TIN KHÁCH */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-blue-900 mb-8 uppercase italic border-l-4 border-blue-600 pl-4 tracking-tighter">
              1. Thông tin người đặt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-bold">
              <div>
                <p className="text-gray-400 uppercase text-[10px] mb-1">
                  Họ tên
                </p>
                <p className="text-lg text-gray-800 uppercase font-black">
                  {bookingData.fullName}
                </p>
              </div>
              <div>
                <p className="text-gray-400 uppercase text-[10px] mb-1">
                  Số điện thoại
                </p>
                <p className="text-lg text-gray-800 font-black">
                  {bookingData.phone}
                </p>
              </div>
            </div>
          </div>

          {/* KHỐI 2: FORM NGÂN HÀNG BIG4 */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-blue-900 mb-8 uppercase italic border-l-4 border-orange-500 pl-4 tracking-tighter">
              2. Thanh toán qua hệ thống Big4 VN
            </h2>

            <div className="p-8 bg-blue-950 text-white rounded-[24px] shadow-2xl space-y-6 border-b-8 border-orange-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest">
                    Chọn Ngân hàng Big4 *
                  </label>
                  <select
                    className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all font-black text-white"
                    value={customerBank.bankName}
                    onChange={(e) =>
                      setCustomerBank({
                        ...customerBank,
                        bankName: e.target.value,
                      })
                    }
                  >
                    <option className="text-gray-900" value="">
                      -- Chọn ngân hàng --
                    </option>
                    <option className="text-gray-900" value="Vietcombank">
                      Vietcombank (VCB)
                    </option>
                    <option className="text-gray-900" value="BIDV">
                      BIDV (Đầu tư & Phát triển)
                    </option>
                    <option className="text-gray-900" value="VietinBank">
                      VietinBank (Công Thương)
                    </option>
                    <option className="text-gray-900" value="Agribank">
                      Agribank (Nông nghiệp)
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest">
                    Số tài khoản *
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập STK ngân hàng của bạn..."
                    className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all font-bold placeholder:text-white/20"
                    onChange={(e) =>
                      setCustomerBank({
                        ...customerBank,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest">
                    Họ tên chủ thẻ (Viết hoa không dấu) *
                  </label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all font-black uppercase tracking-widest"
                    onChange={(e) =>
                      setCustomerBank({
                        ...customerBank,
                        accountName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl text-[11px] italic leading-relaxed border border-white/10 text-center">
                Lưu ý: Bạn vui lòng thực hiện chuyển khoản đúng số tiền
                <span className="text-orange-400 font-black mx-1">
                  {formatPrice(bookingData.total)}
                </span>
                vào tài khoản Admin sau khi xác nhận.
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HÓA ĐƠN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl border-t-[12px] border-blue-600 sticky top-10">
            <h3 className="font-black text-gray-800 text-center uppercase mb-8 border-b pb-6 italic tracking-widest text-sm">
              Hóa đơn chi tiết
            </h3>
            <div className="space-y-6 text-sm mb-10 font-bold">
              <p className="text-blue-800 uppercase text-xs italic leading-tight border-b pb-4">
                {tour.title}
              </p>
              <div className="flex justify-between items-center text-gray-400 text-[10px] uppercase">
                <span>Số lượng vé</span>
                <span className="text-gray-700">
                  {bookingData.adult + bookingData.child} vé
                </span>
              </div>
              <div className="pt-6 border-t-2 border-dashed flex justify-between items-center">
                <span className="font-black text-gray-900 uppercase text-xs italic">
                  Tổng thanh toán:
                </span>
                <span className="text-3xl font-black text-red-600 tracking-tighter tabular-nums">
                  {formatPrice(bookingData.total)}
                </span>
              </div>
            </div>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl transition-all uppercase italic tracking-widest text-sm disabled:bg-gray-400 shadow-blue-100"
            >
              {loading ? "ĐANG XỬ LÝ..." : "Xác nhận & Gửi đơn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
