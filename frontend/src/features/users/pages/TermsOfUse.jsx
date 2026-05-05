import React from "react";

const TermsOfUse = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 text-center tracking-tight">
          📜 Điều Khoản Sử Dụng & Đặt Tour
        </h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">A. Quy Định Đặt Tour & Chọn Chỗ</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Tour trong nước (Ô tô):</strong> Quý khách được quyền chọn trước vị trí ghế ngồi/giường nằm thông qua sơ đồ trực quan của Traveloke. Mỗi ghế đã chọn tương ứng với 1 mã định danh duy nhất (VD: A1, B2) và sẽ được in lên vé điện tử.</li>
              <li><strong>Tour quốc tế (Máy bay):</strong> Hệ thống không hỗ trợ chọn ghế trước. Vị trí ghế ngồi sẽ được hãng hàng không sắp xếp tự động khi Quý khách làm thủ tục check-in tại sân bay.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">B. Hình Thức & Mức Thanh Toán</h2>
            <p className="mb-3">Traveloke cung cấp các giải pháp thanh toán linh hoạt, an toàn:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Mức thanh toán:</strong> Quý khách có thể lựa chọn thanh toán toàn bộ <strong>100%</strong> giá trị đơn hàng hoặc đặt cọc giữ chỗ <strong>50%</strong>.</li>
              <li><strong>Quy định về Đặt cọc:</strong> Nếu chọn đặt cọc 50%, 50% số tiền còn lại bắt buộc phải được thanh toán tại văn phòng Traveloke <strong>trước ngày khởi hành ít nhất 7 ngày</strong>. Nếu quá hạn, hệ thống bảo lưu quyền hủy vé và không hoàn lại tiền cọc.</li>
              <li><strong>Hình thức thanh toán:</strong> Chúng tôi hỗ trợ thanh toán trực tuyến qua cổng VNPay an toàn tuyệt đối, và hình thức Tiền mặt thanh toán trực tiếp.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-blue-700 mb-4 border-b pb-2">C. Trách Nhiệm Của Khách Hàng</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>Quý khách có trách nhiệm cung cấp chính xác địa chỉ Email và Số điện thoại khi đặt tour. Traveloke không chịu trách nhiệm đối với các trường hợp thất lạc Vé điện tử do lỗi nhập sai thông tin.</li>
              <li>Khi tham gia tour, Quý khách vui lòng xuất trình Vé điện tử để hướng dẫn viên đối chiếu và sắp xếp vị trí chỗ ngồi đúng theo mã ghế đã đặt.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;