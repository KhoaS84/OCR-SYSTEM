import { useState } from 'react';
import './Home.css';

function Home({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('info');
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Công Trình',
    age: '18'
  });

  // Sample data for search results
  const sampleData = [
    { 
      id: 1, 
      name: 'Đặng Minh Tân', 
      cardId: '890012134567', 
      dob: '12/01/1993', 
      gender: 'Male', 
      nationality: 'Vietnam',
      code: 'A1',
      birthPlace: 'Thôn 2, xã Minh Tân, Quảng Bình',
      registrationPlace: 'Quảng Bình',
      issueDate: '15/06/2020',
      validity: 'Không thời hạn'
    },
    { 
      id: 2, 
      name: 'Hoàng Minh Kiên', 
      cardId: '890123456789', 
      dob: '30/08/1987', 
      gender: 'Male', 
      nationality: 'Vietnam',
      code: 'B2',
      birthPlace: 'Thôn 5, xã Hoàng Long, Hà Nội',
      registrationPlace: 'Hà Nội',
      issueDate: '20/03/2019',
      validity: 'Không thời hạn'
    },
    { 
      id: 3, 
      name: 'Bùi Thanh Hương', 
      cardId: '567890123456', 
      dob: '25/11/1991', 
      gender: 'Female', 
      nationality: 'Vietnam',
      code: 'C3',
      birthPlace: 'Thôn 8, xã Thanh Hương, Hải Phòng',
      registrationPlace: 'Hải Phòng',
      issueDate: '10/12/2020',
      validity: 'Không thời hạn'
    },
    { 
      id: 4, 
      name: 'Trần Quốc Trường', 
      cardId: '123456789012', 
      dob: '17/08/1994', 
      gender: 'Male', 
      nationality: 'Vietnam',
      code: 'D4',
      birthPlace: 'Thôn 3, xã Quốc Trường, Đà Nẵng',
      registrationPlace: 'Đà Nẵng',
      issueDate: '05/09/2021',
      validity: 'Không thời hạn'
    },
    { 
      id: 5, 
      name: 'Ngô Thị Mỹ Ánh', 
      cardId: '902345678901', 
      dob: '10/04/1994', 
      gender: 'Female', 
      nationality: 'Vietnam',
      code: 'E5',
      birthPlace: 'Thôn 1, xã Mỹ Ánh, Huế',
      registrationPlace: 'Huế',
      issueDate: '22/07/2020',
      validity: 'Không thời hạn'
    },
    { 
      id: 6, 
      name: 'Bùi Thanh Hương', 
      cardId: '567890123456', 
      dob: '25/11/1991', 
      gender: 'Female', 
      nationality: 'Vietnam',
      code: 'F6',
      birthPlace: 'Thôn 6, xã Thanh Minh, Nam Định',
      registrationPlace: 'Nam Định',
      issueDate: '18/01/2021',
      validity: 'Không thời hạn'
    },
    { 
      id: 7, 
      name: 'Ngô Thị Lan', 
      cardId: '789012345678', 
      dob: '05/02/1990', 
      gender: 'Female', 
      nationality: 'Vietnam',
      code: 'G7',
      birthPlace: 'Thôn 9, xã Thị Lan, Nghệ An',
      registrationPlace: 'Nghệ An',
      issueDate: '30/11/2019',
      validity: 'Không thời hạn'
    },
    { 
      id: 8, 
      name: 'Phạm Quỳnh Nga', 
      cardId: '456789012345', 
      dob: '08/03/1988', 
      gender: 'Female', 
      nationality: 'Vietnam',
      code: 'H8',
      birthPlace: 'Thôn 4, xã Quỳnh Nga, Thái Bình',
      registrationPlace: 'Thái Bình',
      issueDate: '12/04/2020',
      validity: 'Không thời hạn'
    },
  ];

  const filteredData = sampleData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cardId.includes(searchQuery)
  );

  const handleRowClick = (person) => {
    setSelectedPerson(person);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  const handleUpdateCard = () => {
    console.log('Update card:', selectedPerson);
    alert('Đã cập nhật thẻ thành công!');
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    console.log('Cập nhật thông tin:', formData);
    alert('Đã cập nhật thông tin thành công!');
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="star-icon">
            <span>⭐</span>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">Nguyễn Công Trình</span>
          <div className="user-avatar">
            <img src="https://via.placeholder.com/40" alt="Avatar" />
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <img src="/logo-bo-cong-an.png" alt="Bộ Công An" />
            <span className="sidebar-title">BỘ CÔNG AN</span>
            <span className="sidebar-subtitle">Trung tâm Dữ liệu Quốc gia về Dân cư</span>
          </div>

          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <span className="menu-icon">👤</span>
              <span>Thông tin cá nhân</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'cccd' ? 'active' : ''}`}
              onClick={() => setActiveTab('cccd')}
            >
              <span className="menu-icon">🆔</span>
              <span>Căn cước công dân</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'insurance' ? 'active' : ''}`}
              onClick={() => setActiveTab('insurance')}
            >
              <span className="menu-icon">🏥</span>
              <span>Bảo hiểm y tế</span>
            </button>
            <button 
              className={`menu-item ${activeTab === 'license' ? 'active' : ''}`}
              onClick={() => setActiveTab('license')}
            >
              <span className="menu-icon">🚗</span>
              <span>Giấy phép xe</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          <div className="page-header">
            <h2>Xin chào <strong>Nguyễn Công Trình</strong></h2>
          </div>

          {/* Collapsible Section - Only show in info tab */}
          {activeTab === 'info' && (
            <div className="info-section">
              <button 
                className="section-toggle"
                onClick={() => setShowPersonalInfo(!showPersonalInfo)}
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
          )}

          {/* Search Tab Content */}
          {(activeTab === 'cccd' || activeTab === 'insurance' || activeTab === 'license') && (
            <div className="search-content">
              <div className="search-header">
                <h3>Search</h3>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Enter ID card, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Card ID</th>
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Nationality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} onClick={() => handleRowClick(item)} className="clickable-row">
                        <td>
                          <div className="table-avatar">
                            <img src="https://via.placeholder.com/40" alt="Avatar" />
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.cardId}</td>
                        <td>{item.dob}</td>
                        <td>{item.gender}</td>
                        <td>{item.nationality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && selectedPerson && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update cards</h3>
            </div>
            
            <div className="modal-body">
              <div className="modal-left">
                <div className="modal-form-group">
                  <label>Họ tên</label>
                  <input type="text" value={selectedPerson.name.toUpperCase()} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Mã số</label>
                  <input type="text" value={selectedPerson.cardId} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Tên</label>
                  <input type="text" value={selectedPerson.code} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Quốc tịch</label>
                  <input type="text" value={selectedPerson.nationality.toUpperCase()} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Ngày sinh</label>
                  <input type="text" value={selectedPerson.dob} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Quê quán</label>
                  <input type="text" value={selectedPerson.birthPlace} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Nơi đăng ký</label>
                  <input type="text" value={selectedPerson.registrationPlace} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Ngày cấp</label>
                  <input type="text" value={selectedPerson.issueDate} readOnly />
                </div>

                <div className="modal-form-group">
                  <label>Hiệu lực</label>
                  <input type="text" value={selectedPerson.validity} readOnly />
                </div>
              </div>

              <div className="modal-right">
                <div className="card-preview">
                  <img src="https://via.placeholder.com/300x200?text=CCCD" alt="CCCD Preview" />
                </div>
                <div className="modal-info">
                  <div className="info-row">
                    <span className="info-label">Level</span>
                    <span className="info-label">Nationality</span>
                  </div>
                  <div className="info-row">
                    <span className="info-value">{selectedPerson.code}</span>
                    <span className="info-value">VIỆT NAM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-update" onClick={handleUpdateCard}>
                Update
              </button>
              <button className="btn-modal-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
