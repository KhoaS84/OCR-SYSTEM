
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

function PersonalInfoSection({ showPersonalInfo, togglePersonalInfo, formData, handleInputChange, handleUpdate }) {
  const { user: currentUser } = useStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = () => {
    handleUpdate({ email, username, password: newPassword });
    setNewPassword('');
  };

  return (
    <div className="info-section">
      <button
        className="section-toggle"
        onClick={togglePersonalInfo}
      >
        <span>Thông tin đăng ký</span>
        <span className={`arrow ${showPersonalInfo ? 'up' : 'down'}`}>▼</span>
      </button>

      {showPersonalInfo && (
        <div className="section-content">
          <h3>Thông tin cá nhân</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới (để trống nếu không đổi)</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Nhập mật khẩu mới..."
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-update" onClick={handleUpdateProfile}>
              Cập nhật
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoSection;
