import useStore from '../store/useStore';
function Header({ userName }) {
  
  const logout = useStore((state) => state.logout);
  return (
    <header className="header">
      <div className="header-left">
        <div className="star-icon">
          <span>⭐</span>
        </div>
      </div>
      <div className="header-right">
        <span className="user-name">{userName}</span>
        <div className="user-avatar">
          <img src="https://via.placeholder.com/40" alt="Avatar" />
        </div>
        <button className="btn-logout" onClick={() => { logout(); window.location.href = '/login'; }} style={{marginLeft:16}}>Đăng xuất</button>
      </div>
    </header>
  );
}

export default Header;
