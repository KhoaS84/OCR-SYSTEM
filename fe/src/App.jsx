import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (username) => {
    setIsLoggedIn(true)
    setUser({ username })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <>
      {isLoggedIn ? (
        <Home user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  )
}

export default App
