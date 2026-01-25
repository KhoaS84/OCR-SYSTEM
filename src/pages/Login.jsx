import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      // Login user with store
      login({ username, fullName: 'Nguyễn Công Trình' });
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo-bo-cong-an.png" alt="Bộ Công An" className="logo" />
        </div>
        
        <h2 className="login-title">Đăng nhập VNeID</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="login-links">
          <span className="register-link">
            Don't have an account? <a href="#">Register</a>
          </span>
          <a href="#" className="forgot-link">Forgot Password</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
