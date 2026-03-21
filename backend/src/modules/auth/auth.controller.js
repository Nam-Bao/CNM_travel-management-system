const User = require("../users/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// [POST] /api/auth/register - Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // 1. Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    // 2. Mã hóa mật khẩu (Băm mật khẩu)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới với mật khẩu đã mã hóa
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
    });

    // Trả về kết quả (Tuyệt đối không trả về password)
    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [POST] /api/auth/login - Đăng nhập hệ thống
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // 2. So sánh mật khẩu gốc (req.body) với mật khẩu đã băm trong DB
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // 3. Tạo token JWT (Vé thông hành)
    // Payload chứa id và role để phân quyền sau này, token có hạn 1 ngày (1d)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 4. Trả về token và thông tin cơ bản
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
