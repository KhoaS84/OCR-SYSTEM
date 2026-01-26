import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PersonalInfoSection from '../components/PersonalInfoSection';
import SearchTable from '../components/SearchTable';
import DetailModal from '../components/DetailModal';
import useStore from '../store/useStore';
import { citizensAPI, usersAPI } from '../services/api';
import '../styles/Home.css';

function Home() {
  const [citizensData, setCitizensData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get state and actions from store
  const {
    activeTab,
    setActiveTab,
    showPersonalInfo,
    togglePersonalInfo,
    formData,
    updateFormData,
    searchQuery,
    setSearchQuery,
    selectedPerson,
    showModal,
    openModal,
    closeModal,
  } = useStore();

  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userData = await usersAPI.getMe();
        setCurrentUser(userData);
      } catch (err) {
        console.error('Failed to load user info:', err);
      }
    };
    
    loadUserInfo();
  }, []);

  // Load citizens data when search or tab changes
  useEffect(() => {
    const loadCitizens = async () => {
      setLoading(true);
      setError('');
      
      try {
        let data;
        if (searchQuery.trim()) {
          // Tìm kiếm theo query
          data = await citizensAPI.search(searchQuery);
        } else {
          // Lấy tất cả (có thể cần thêm API endpoint để lấy all)
          data = await citizensAPI.search('');
        }
        
        setCitizensData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu');
        setCitizensData([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'info') {
      loadCitizens();
    }
  }, [searchQuery, activeTab]);

  const filteredData = citizensData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleUpdate = async () => {
    if (!currentUser) return;
    
    try {
      await usersAPI.updateProfile(formData);
      alert('Đã cập nhật thông tin thành công!');
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  const handleUpdateCard = async () => {
    if (!selectedPerson) return;
    
    try {
      await citizensAPI.update(selectedPerson.id, selectedPerson);
      alert('Đã cập nhật thẻ thành công!');
      closeModal();
      // Reload data
      const data = await citizensAPI.search(searchQuery);
      setCitizensData(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  return (
    <div className="home-container">
      <Header userName={currentUser?.full_name || currentUser?.username || 'User'} />

      <div className="main-content">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="content-area">
          <div className="page-header">
            <h2>Xin chào <strong>{currentUser?.full_name || currentUser?.username || 'User'}</strong></h2>
          </div>

          {activeTab === 'info' && (
            <PersonalInfoSection
              showPersonalInfo={showPersonalInfo}
              togglePersonalInfo={togglePersonalInfo}
              formData={formData}
              handleInputChange={handleInputChange}
              handleUpdate={handleUpdate}
            />
          )}

          {(activeTab === 'cccd' || activeTab === 'insurance' || activeTab === 'license') && (
            <>
              {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>}
              {error && <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>}
              {!loading && !error && (
                <SearchTable
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredData={filteredData}
                  onRowClick={openModal}
                />
              )}
            </>
          )}
        </main>
      </div>

      <DetailModal
        selectedPerson={selectedPerson}
        showModal={showModal}
        onClose={closeModal}
        onUpdate={handleUpdateCard}
      />
    </div>
  );
}

export default Home;
