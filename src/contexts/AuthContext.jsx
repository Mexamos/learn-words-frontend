import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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
      })
      .catch(() => {
        console.error('Failed to fetch user profile')
        localStorage.removeItem('access_token')
        navigate('/login')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Функция логина
  const login = credential => {
    return api.post('/auth/login', { credential })
      .then(res => {
        const { access_token, user } = res.data
        localStorage.setItem('access_token', access_token)
        api.defaults.headers.Authorization = `Bearer ${access_token}`
        setUser(user)
        navigate('/')
      })
  }

  // Функция логаута
  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    api.defaults.headers.Authorization = null
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
