function Header({ userName }) {
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
      </div>
    </header>
  );
}

export default Header;
