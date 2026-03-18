const jwt = require('jsonwebtoken');

// 1. Kiểm tra người dùng đã đăng nhập chưa (Dành cho mọi user)
const verifyToken = (req, res, next) => {
    // Token thường được gửi kèm trong Header với định dạng: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập. Vui lòng cung cấp token!' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần <token> phía sau chữ Bearer

    try {
        // Giải mã token bằng chữ ký bí mật
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Gắn thông tin giải mã được (id, role) vào req để các hàm sau dùng
        next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// 2. Kiểm tra xem người dùng có phải là Admin không
const verifyAdmin = (req, res, next) => {
    // Đầu tiên vẫn phải kiểm tra xem có token hợp lệ không đã
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next(); // Là admin -> Cho đi tiếp
        } else {
            res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này!' });
        }
    });
};

module.exports = {
    verifyToken,
    verifyAdmin
};