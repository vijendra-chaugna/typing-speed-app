import { createContext, useContext, useState, useCallback } from 'react'
import { googleLogout } from '@react-oauth/google'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ts_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('ts_token') || null)

  const login = useCallback(async (googleToken) => {
    try {
      const data = await api.post('/auth/google', { token: googleToken })
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem('ts_user', JSON.stringify(data.user))
      localStorage.setItem('ts_token', data.token)
      toast.success(`Welcome, ${data.user.name}!`)
    } catch (e) {
      toast.error('Login failed. Please try again.')
    }
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    setUser(null)
    setToken(null)
    localStorage.removeItem('ts_user')
    localStorage.removeItem('ts_token')
    toast('Logged out', { icon: '👋' })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
