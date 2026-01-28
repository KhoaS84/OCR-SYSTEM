import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import '../styles/UserManagement.css';
import useStore from '../store/useStore';
import '../styles/UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { user: currentUser } = useStore();

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await usersAPI.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setNewPassword('');
    setShowEditModal(true);
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      alert('Đã xóa người dùng thành công!');
      loadUsers();
    } catch (err) {
      alert('Xóa thất bại: ' + err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const updateData = {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
      };
      // Add password only if provided
      if (newPassword.trim()) {
        updateData.password = newPassword;
      }
      await usersAPI.updateUser(editingUser.id, updateData);
      alert('Đã cập nhật người dùng thành công!');
      setShowEditModal(false);
      setEditingUser(null);
      setNewPassword('');
      loadUsers();
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="role-badge admin">Admin</span>;
    }
    return <span className="role-badge user">User</span>;
  };

  if (loading) {
    return <div className="user-management-loading">Đang tải danh sách người dùng...</div>;
  }

  if (error) {
    return <div className="user-management-error">{error}</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3>Quản lý người dùng</h3>
        <button className="btn-refresh" onClick={loadUsers}>
          🔄 Tải lại
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user => user.role === 'user').map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{formatDate(user.created_at)}</td>
                <td className="actions-cell">
                  {/* Ẩn nút sửa/xóa với user đang đăng nhập */}
                  {currentUser && currentUser.id !== user.id && (
                    <>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(user.id, user.username)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-users">Không có người dùng nào</div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa người dùng</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên đăng nhập:</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mật khẩu mới (để trống nếu không đổi):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
