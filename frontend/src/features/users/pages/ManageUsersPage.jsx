import React, { useState, useEffect } from 'react';
import userApi from '../api/userApi';

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    
    // State cho Tìm kiếm và Lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'customer'

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await userApi.getAllUsers();
                setUsers(response.data);
            } catch (err) {
                console.error('Lỗi tải danh sách user:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Hàm xử lý Đổi Quyền (Giữ nguyên logic cũ)
    const handleRoleChange = async (user, newRole) => {
        if (window.confirm(`⚠️ Bạn muốn đổi quyền của "${user.email}" sang ${newRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'}?`)) {
            setActionLoading(user._id);
            try {
                await userApi.updateUserRole(user._id, newRole);
                setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
            } catch (err) {
                alert(`❌ Lỗi: ${err.response?.data?.message || err.message}`);
            } finally {
                setActionLoading(null);
            }
        }
    };

    // Hàm xử lý Khóa / Mở khóa (Soft Delete)
    const handleToggleStatus = async (user) => {
        const isBanning = user.status !== 'banned';
        const actionText = isBanning ? 'KHÓA' : 'MỞ KHÓA';
        
        if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.email}"?`)) {
            setActionLoading(user._id);
            try {
                const response = await userApi.toggleUserStatus(user._id);
                // Cập nhật lại status của user trong danh sách hiện tại
                const newStatus = isBanning ? 'banned' : 'active';
                setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
            } catch (err) {
                alert(`❌ Lỗi: ${err.response?.data?.message || err.message}`);
            } finally {
                setActionLoading(null);
            }
        }
    };

    // LOGIC LỌC & TÌM KIẾM
    const filteredUsers = users.filter(user => {
        // 1. Lọc theo tên hoặc email
        const searchString = searchTerm.toLowerCase();
        const matchesSearch = 
            (user.username && user.username.toLowerCase().includes(searchString)) || 
            (user.email && user.email.toLowerCase().includes(searchString));
            
        // 2. Lọc theo quyền (Role)
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="bg-white p-6 rounded-xl shadow-md min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">👥 Danh Sách Người Dùng</h2>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold shadow-inner text-sm">
                    Hiển thị: {filteredUsers.length} / {users.length}
                </div>
            </div>

            {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="🔍 Tìm theo tên hoặc email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                    >
                        <option value="all">Phân loại: Tất cả</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                        <option value="customer">Khách hàng</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-10 font-medium">Đang tải dữ liệu...</p>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">Không tìm thấy tài khoản nào phù hợp.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tài khoản</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Vai trò</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className={`transition-colors ${user.status === 'banned' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold uppercase shadow-sm text-white ${user.status === 'banned' ? 'bg-red-400' : 'bg-blue-600'}`}>
                                                {user.email.charAt(0)}
                                            </div>
                                            <div className="font-bold text-gray-800">
                                                {user.full_name || 'Khách hàng'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {/* Hiển thị Trạng thái */}
                                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${user.status === 'banned' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                            {user.status === 'banned' ? '🚫 Đã khóa' : '✅ Hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">
                                        {actionLoading === user._id ? (
                                            <span className="text-gray-400 text-xs">Đang xử lý...</span>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <select 
                                                    value={user.role} 
                                                    onChange={(e) => handleRoleChange(user, e.target.value)}
                                                    disabled={user.status === 'banned'}
                                                    className="bg-white border border-gray-300 text-sm px-2 py-1 rounded-md focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="customer">Khách hàng</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                
                                                {/* Nút Khóa / Mở Khóa Động */}
                                                <button 
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`px-3 py-1 rounded transition-colors text-xs font-bold border ${
                                                        user.status === 'banned' 
                                                        ? 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200' 
                                                        : 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                                                    }`}
                                                >
                                                    {user.status === 'banned' ? '🔓 Mở khóa' : '🔒 Khóa'}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageUsersPage;