// Lưu ý: Đường dẫn đến file user.model có thể khác tùy thuộc vào lúc bạn làm tính năng Auth
// Hãy sửa lại đường dẫn require('./user.model') cho đúng với vị trí file Model của bạn nhé!
const User = require('../users/user.model'); // Ví dụ thư mục auth chứa model

// [GET] /api/users - Lấy danh sách tất cả User (Chỉ Admin)
const getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả user, NHƯNG loại bỏ trường password (-password) để bảo mật
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

// [PUT] /api/users/:id/role - Cập nhật quyền (role) của người dùng (Chỉ Admin)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        // Bảo mật: Không cho phép đổi thành role linh tinh
        if (!['admin', 'customer'].includes(role)) {
            return res.status(400).json({ status: 'error', message: 'Vai trò không hợp lệ!' });
        }

        // Bảo mật tối thượng: Không cho phép Admin tự đổi role của chính mình (để tránh mất quyền admin)
        if (req.params.id === req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Bạn không thể tự đổi quyền của chính mình!' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after', runValidators: true } // Đã đổi chữ new: true
        ).select('-password'); // Đừng trả về password

        if (!updatedUser) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy người dùng!' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Đã cập nhật vai trò người dùng thành công!',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi khi cập nhật quyền người dùng' });
    }
};

// [PUT] /api/users/:id/status - Khóa hoặc Mở khóa người dùng (Chỉ Admin)
const toggleUserStatus = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Bạn không thể tự khóa chính mình!' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy người dùng!' });
        }

        // Đảo ngược trạng thái: Nếu đang active thì thành banned, và ngược lại
        user.status = user.status === 'active' ? 'banned' : 'active';
        await user.save();

        res.status(200).json({
            status: 'success',
            message: `Tài khoản đã bị ${user.status === 'banned' ? 'KHÓA' : 'MỞ KHÓA'} thành công!`,
            data: { _id: user._id, status: user.status }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Lỗi khi thay đổi trạng thái người dùng' });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole, 
    toggleUserStatus
};