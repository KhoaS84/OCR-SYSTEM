import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { authAPI, usersAPI } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      setLoading(true);
      setError('');
      
      try {
        // Đăng nhập qua API
        await authAPI.login(username, password);
        
        // Lấy thông tin user
        const userData = await usersAPI.getMe();
        
        // Lưu vào store
        login({ 
          username: userData.username, 
          fullName: userData.full_name || userData.username 
        });
        
        navigate('/home');
      } catch (err) {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo-bo-cong-an.png" alt="Bộ Công An" className="logo" />
        </div>
        
        <h2 className="login-title">Đăng nhập VNeID</h2>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            disabled={loading}
          />
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Sign In'}
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
