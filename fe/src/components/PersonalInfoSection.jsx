function PersonalInfoSection({ showPersonalInfo, togglePersonalInfo, formData, handleInputChange, handleUpdate }) {
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

          <div className="avatar-upload">
            <div className="avatar-placeholder">
              <img src="https://via.placeholder.com/100" alt="Avatar" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Tuổi</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-update" onClick={handleUpdate}>
              Cập nhật
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoSection;
