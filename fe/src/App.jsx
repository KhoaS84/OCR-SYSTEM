import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import useStore from './store/useStore';
import { useEffect } from 'react';

function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const login = useStore((state) => state.login);
  const authLoading = useStore((state) => state.authLoading);
  const setAuthLoading = useStore((state) => state.setAuthLoading);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch(
          import.meta.env.VITE_API_URL + '/api/v1/users/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Unauthorized');

        const user = await res.json();
        localStorage.setItem('taskflow_user', JSON.stringify(user));
        login(user);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, [login, setAuthLoading]);

  // 🔥 CHỐT CHẶN QUAN TRỌNG
  if (authLoading) {
    return <div>Loading...</div>; // hoặc spinner
  }

  return isAuthenticated ? <Home /> : <Login />;
}

export default App;
