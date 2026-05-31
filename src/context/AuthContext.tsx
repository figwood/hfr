import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { apiClient } from '../api/client'
import { getToken, setToken, removeToken, decodeJwtPayload, isTokenExpired } from '../utils/auth'

interface AuthUser {
  id: string
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function resolveUserFromToken(): AuthUser | null {
  const token = getToken()
  if (!token || isTokenExpired(token)) return null
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  return { id: payload.sub, username: payload.username }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(resolveUserFromToken)

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await apiClient.post<{ token: string }>('/auth/login', { username, password })
    setToken(token)
    const payload = decodeJwtPayload(token)
    if (payload) {
      setUser({ id: payload.sub, username: payload.username })
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
