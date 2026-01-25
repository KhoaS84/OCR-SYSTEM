import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
import useStore from './store/useStore'

function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <>
      {isAuthenticated ? (
        <Home />
      ) : (
        <Login />
      )}
    </>
  )
}

export default App
