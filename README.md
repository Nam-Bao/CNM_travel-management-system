# 🌍 Hệ Thống Quản Lý Du Lịch (Travel Management System)

Dự án xây dựng nền tảng đặt tour du lịch và quản lý nghiệp vụ cho công ty du lịch. 
Hệ thống được chia làm 2 phần: Frontend (ReactJS) dành cho giao diện người dùng/admin và Backend (NodeJS + MySQL) xử lý logic.

## 🛠 Công nghệ sử dụng
* **Frontend:** ReactJS, Tailwind CSS / Bootstrap
* **Backend:** NodeJS, ExpressJS
* **Database:** MySQL (REST API)
* **Bảo mật:** JWT (JSON Web Token), bcrypt (Mã hóa mật khẩu)

---

## 📂 Cấu trúc Codebase & Chức năng từng Module

Dự án áp dụng kiến trúc **Feature-based** (chia theo chức năng) để dễ dàng quản lý. Dưới đây là mục đích và tính năng của các thư mục quan trọng để bạn dễ dàng nắm bắt:

### 1. Backend (`/backend/src/modules/`)
Nơi chứa toàn bộ API và logic xử lý, chia thành các phân hệ:
* **`auth/`**: Chịu trách nhiệm xác thực. Chứa logic băm mật khẩu (bcrypt), đăng ký, kiểm tra tài khoản và sinh mã JWT khi người dùng đăng nhập thành công.
* **`users/`**: Xử lý việc lấy thông tin hồ sơ (profile) của khách hàng, cập nhật thông tin cá nhân và phân quyền (customer/admin).
* **`tours/`**: Trái tim của hệ thống. Chứa các API CRUD (Thêm/Sửa/Xóa) tour cho Admin và API tìm kiếm, lọc danh sách tour hiển thị cho khách hàng.
* **`bookings/`**: Module xử lý nghiệp vụ đặt chỗ. Nhận yêu cầu đặt tour, tính toán tổng tiền, trừ số lượng ghế trống (`available_seats`) và quản lý trạng thái thanh toán.
* **`reviews/`**: Module lưu trữ và truy xuất các đánh giá (1-5 sao) của khách hàng sau khi hoàn thành chuyến đi.

### 2. Frontend (`/frontend/src/features/`)
Nơi chứa giao diện tương tác, ánh xạ 1-1 với Backend:
* **`auth/`**: Chứa Form đăng nhập, đăng ký. Gọi API sang backend và lưu token JWT vào Local Storage.
* **`tours/`**: Chứa thẻ hiển thị Tour (TourCard), trang chi tiết Tour và bộ lọc tìm kiếm cho khách.
* **`bookings/`**: Chứa Form điền thông tin người đi, chọn phương thức thanh toán và bảng lịch sử đặt tour.
* **`admin/`**: Giao diện Dashboard riêng biệt biệt rạch ròi với giao diện khách, dùng để quản lý hệ thống (chỉ hiển thị khi tài khoản có role là 'admin').

---

## 🚀 Hướng dẫn cài đặt và chạy dự án (Dành cho Team)

### Bước 1: Clone dự án về máy
\`\`\`bash
git clone <link-github-cua-du-an>
cd travel-management-system
\`\`\`

### Bước 2: Thiết lập Backend
1. Mở terminal mới, di chuyển vào thư mục backend: `cd backend`
2. Cài đặt các thư viện: `npm install`
3. Tạo file `.env` ngang hàng với `package.json` và cấu hình Database:
   \`\`\`env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=mat_khau_mysql_cua_ban
   DB_NAME=travel_db
   JWT_SECRET=chuoi_ky_tu_bi_mat_bat_ky
   \`\`\`
4. Chạy Backend: `npm start` hoặc `npm run dev` (nếu dùng nodemon).

### Bước 3: Thiết lập Frontend
1. Mở một terminal khác, di chuyển vào thư mục frontend: `cd frontend`
2. Cài đặt các thư viện: `npm install`
3. Tạo file `.env` và khai báo link gọi API:
   \`\`\`env
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`
4. Chạy Frontend: `npm start` hoặc `npm run dev` (nếu dùng Vite).

---



