import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VnpayReturn = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Lấy toàn bộ query string trên URL do VNPay trả về
                const queryString = searchParams.toString();
                
                // Mã vnp_ResponseCode == '00' nghĩa là giao dịch thành công
                const responseCode = searchParams.get('vnp_ResponseCode');
                
                if (responseCode === '00') {
                    // Tùy chọn: Gọi API Backend để đối chiếu chữ ký bảo mật (checksum) ở đây để chắc chắn 100% không bị hack
                    // await axios.get(`http://localhost:5000/api/payment/vnpay/vnpay_return?${queryString}`);
                    
                    setStatus('success');
                    setMessage('Thanh toán thành công! Chúc bạn có một chuyến đi tuyệt vời.');
                } else {
                    setStatus('failed');
                    setMessage('Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại sau.');
                }
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
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                            ✓
                        </div>
                        <h2 className="text-3xl font-black text-green-600 mb-2">Thành Công!</h2>
                        <p className="text-gray-600 font-medium mb-8">{message}</p>
                        
                        <Link 
                            to="/my-bookings" 
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
                        >
                            Xem Lịch Sử Đặt Tour
                        </Link>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                            ✖
                        </div>
                        <h2 className="text-3xl font-black text-red-600 mb-2">Thất Bại</h2>
                        <p className="text-gray-600 font-medium mb-8">{message}</p>
                        
                        <div className="flex gap-3">
                            <Link 
                                to="/" 
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                            >
                                Về Trang Chủ
                            </Link>
                            <Link 
                                to="/my-bookings" 
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition"
                            >
                                Xem Đơn Hàng
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VnpayReturn;