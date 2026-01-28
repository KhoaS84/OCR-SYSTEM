import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PersonalInfoSection from '../components/PersonalInfoSection';
import SearchTable from '../components/SearchTable';
import DetailModal from '../components/DetailModal';
import UserManagement from '../components/UserManagement';
import useStore from '../store/useStore';
import { citizensAPI, usersAPI } from '../services/api';
import { updateCCCD } from '../services/documentsAdmin';
import '../styles/Home.css';

function Home() {
  const [citizensData, setCitizensData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

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
    logout,
  } = useStore();
  window.__ZUSTAND_LOGOUT__ = logout;

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

  // Load citizens data
  useEffect(() => {
    const loadCitizens = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await citizensAPI.search(searchQuery || '');
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

  // ✅ HANDLE UPDATE CARD (LOGIC ĐƯỢC ĐƯA RA NGOÀI JSX)
  const handleUpdateCard = async () => {
    if (!selectedPerson) return;

    try {
      let updatedId = null;
      if (activeTab === 'cccd') {
        const { document_id, ...data } = selectedPerson;
        await updateCCCD(document_id, { ...data, document_id });
        updatedId = document_id;
      } else {
        await citizensAPI.update(selectedPerson.id, selectedPerson);
        updatedId = selectedPerson.id;
      }

      const updatedCitizens = await citizensAPI.search(searchQuery);
      setCitizensData(Array.isArray(updatedCitizens) ? updatedCitizens : []);

      // Luôn reload lại detailData từ BE bằng document_id/id vừa cập nhật
      if (activeTab === 'cccd' && updatedId) {
        const newDetail = await citizensAPI.getCCCDByCitizen(updatedId);
        setDetailData({
          ...newDetail,
          document_id: newDetail.document_id,
        });
        setTimeout(closeModal, 100);
      } else {
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal
  const handleOpenModal = async (person) => {
    setDetailData(null);
    setDetailError('');
    setDetailLoading(true);

    try {
      if (activeTab === 'cccd') {
        const data = await citizensAPI.getCCCDByCitizen(person.id);
        const documentId = data.document_id || data.id;
        setDetailData({
          ...person,
          ...data,
          document_id: documentId,
          id: documentId,
          type: 'cccd',
        });
      } else if (activeTab === 'insurance') {
        const data = await citizensAPI.getBHYTByCitizen(person.id);
        setDetailData({ ...person, ...data, type: 'bhyt' });
      } else {
        setDetailData(person);
      }
      openModal(person);
    } catch (err) {
      setDetailError('Không thể tải chi tiết');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Header
        userName={currentUser?.full_name || currentUser?.username || 'User'}
      />

      <div className="main-content">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />

        <main className="content-area">
          <div className="page-header">
            <h2>
              Xin chào{' '}
              <strong>
                {currentUser?.full_name || currentUser?.username || 'User'}
              </strong>
            </h2>
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

          {(activeTab === 'cccd' ||
            activeTab === 'insurance') && (
            <>
              {loading && <div style={{ padding: 20 }}>Đang tải...</div>}
              {error && (
                <div style={{ padding: 20, color: 'red' }}>{error}</div>
              )}
              {!loading && !error && (
                <SearchTable
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredData={citizensData}
                  onRowClick={handleOpenModal}
                />
              )}
            </>
          )}

          {activeTab === 'users' && <UserManagement />}
        </main>
      </div>

      {/* ✅ JSX CHUẨN – KHÔNG LOGIC */}
      <DetailModal
        selectedPerson={detailData}
        showModal={showModal}
        onClose={closeModal}
        onUpdate={handleUpdateCard}
        loading={detailLoading}
        error={detailError}
        activeTab={activeTab}   // <-- THÊM DÒNG NÀY
      />
    </div>
  );
}

export default Home;
