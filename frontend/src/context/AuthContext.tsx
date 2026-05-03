import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  rol: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [rol, setRol] = useState<string | null>(localStorage.getItem('rol'))

  const login = (newToken: string) => {
    // Decodificar el token para obtener el rol
    const payload = JSON.parse(atob(newToken.split('.')[1]))
    const userRol = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('rol', userRol)
    setToken(newToken)
    setRol(userRol)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    setToken(null)
    setRol(null)
  }

  return (
    <AuthContext.Provider value={{ token, rol, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}