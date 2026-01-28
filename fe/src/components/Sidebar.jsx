function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const menuItems = [
    { id: 'info', icon: '👤', label: 'Thông tin cá nhân' },
    { id: 'cccd', icon: '🆔', label: 'Căn cước công dân' },
    { id: 'insurance', icon: '🏥', label: 'Bảo hiểm y tế' },
    // { id: 'license', icon: '🚗', label: 'Giấy phép xe' }, // Ẩn tab GPLX
  ];

  // Add Users tab for admin only
  if (currentUser && currentUser.role === 'admin') {
    menuItems.push({ id: 'users', icon: '👥', label: 'Quản lý người dùng' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo-bo-cong-an.png" alt="Bộ Công An" />
        <span className="sidebar-title">BỘ CÔNG AN</span>
        <span className="sidebar-subtitle">Trung tâm Dữ liệu Quốc gia về Dân cư</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
