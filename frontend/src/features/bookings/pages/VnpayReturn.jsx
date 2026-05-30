import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VnpayReturn = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Mã vnp_ResponseCode == '00' nghĩa là giao dịch thành công
                const responseCode = searchParams.get('vnp_ResponseCode');
                const bookingId = searchParams.get('vnp_TxnRef'); // Lấy mã đơn hàng VNPay trả về
                
                if (responseCode === '00') {
                    // Thành công: Cập nhật trạng thái thành công ở đây (Nếu Backend chưa làm việc này)
                    const token = localStorage.getItem('token');
                    // Phải có dòng này thì Backend mới biết mà gửi mail!
                    await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/payment/vnpay/vnpay_return?${searchParams.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setStatus('success');
                    setMessage('Thanh toán thành công! Chúc bạn có một chuyến đi tuyệt vời.');
                } else {
                    // THẤT BẠI HOẶC KHÁCH BỎ QUAY XE: Xử lý dọn rác Database
                    setStatus('failed');
                    
                    if (responseCode === '24') {
                        setMessage('Bạn đã hủy giao dịch thanh toán.');
                    } else {
                        setMessage('Thanh toán thất bại hoặc có lỗi xảy ra.');
                    }

                    // TỰ ĐỘNG GỌI API HỦY ĐƠN HÀNG "RÁC" TRONG DATABASE
                    if (bookingId) {
                        try {
                            const token = localStorage.getItem('token');
                            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            console.log("Đã dọn dẹp đơn hàng rác do khách hủy thanh toán.");
                        } catch (cancelErr) {
                            console.error("Không thể tự động hủy đơn rác:", cancelErr);
                        }
                    }
                }
                // Xóa query URL cho đẹp
                window.history.replaceState(null, '', window.location.pathname);
            } catch (error) {
                setStatus('failed');
                setMessage('Lỗi xác thực giao dịch.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Đang xử lý giao dịch...</h2>
                        <p className="text-gray-500">Vui lòng không đóng trình duyệt lúc này.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">✓</div>
                        <h2 className="text-3xl font-black text-green-600 mb-2">Thành Công!</h2>
                        <p className="text-gray-600 font-medium mb-8">{message}</p>
                        
                        <Link to="/my-bookings" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition">
                            Xem Lịch Sử Đặt Tour
                        </Link>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">✖</div>
                        <h2 className="text-3xl font-black text-red-600 mb-2">Thất Bại</h2>
                        <p className="text-gray-600 font-medium mb-8">{message}</p>
                        
                        <div className="flex gap-3">
                            <Link to="/" className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                                Về Trang Chủ
                            </Link>
                            <Link to="/my-bookings" className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition">
                                Xem Đơn Hàng Đã Hủy
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VnpayReturn;