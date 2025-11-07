import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/index'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsLanguageSetup, setNeedsLanguageSetup] = useState(false)
  const navigate = useNavigate()

  // При старте пытаемся получить профиль по токену
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }

    api.defaults.headers.Authorization = `Bearer ${token}`
    api.get('/me')
      .then(res => {
        setUser(res.data)
        // Check if user needs to set native language
        if (!res.data.native_language) {
          setNeedsLanguageSetup(true)
        }
      })
      .catch(() => {
        console.error('Failed to fetch user profile')
        localStorage.removeItem('access_token')
        navigate('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [navigate])

  // Функция логина
  const login = credential => {
    return api.post('/auth/login', { credential })
      .then(res => {
        const { access_token, user } = res.data
        localStorage.setItem('access_token', access_token)
        api.defaults.headers.Authorization = `Bearer ${access_token}`
        setUser(user)
        // Check if user needs to set native language
        if (!user.native_language) {
          setNeedsLanguageSetup(true)
        }
        navigate('/')
      })
  }

  // Функция логаута
  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    setNeedsLanguageSetup(false)
    api.defaults.headers.Authorization = null
    navigate('/login')
  }

  // Функция обновления пользователя
  const updateUser = (userData) => {
    setUser(userData)
    // Check if language setup is now complete
    if (userData.native_language) {
      setNeedsLanguageSetup(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, needsLanguageSetup, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
