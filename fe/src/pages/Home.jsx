import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PersonalInfoSection from '../components/PersonalInfoSection';
import SearchTable from '../components/SearchTable';
import DetailModal from '../components/DetailModal';
import useStore from '../store/useStore';
import '../styles/Home.css';

const SAMPLE_DATA = [
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

function Home() {
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

  const filteredData = SAMPLE_DATA.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cardId.includes(searchQuery)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleUpdate = () => {
    console.log('Cập nhật thông tin:', formData);
    alert('Đã cập nhật thông tin thành công!');
  };

  const handleUpdateCard = () => {
    console.log('Update card:', selectedPerson);
    alert('Đã cập nhật thẻ thành công!');
    closeModal();
  };

  return (
    <div className="home-container">
      <Header userName="Nguyễn Công Trình" />

      <div className="main-content">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="content-area">
          <div className="page-header">
            <h2>Xin chào <strong>Nguyễn Công Trình</strong></h2>
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
            <SearchTable
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredData={filteredData}
              onRowClick={openModal}
            />
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
