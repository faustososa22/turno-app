import { useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser, JwtPayload} from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

function normalizeRole(roleRaw: unknown): 'admin' | 'barbero' | 'cliente' {
    if (roleRaw === 'admin' || roleRaw === 'barbero' || roleRaw === 'cliente') {
      return roleRaw
    }
    return 'cliente'
  }

function mapTokenToUser(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    const rawId =
      decoded.nameid ??
      decoded.sub ??
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']

    const rawEmail =
      decoded.email ??
      decoded.unique_name ??
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']

    const rawRole =
      decoded.role ??
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

    const id = Number(rawId)

    if (!id || Number.isNaN(id) || !rawEmail) return null

    return {
      id,
      email: String(rawEmail),
      rol: normalizeRole(rawRole),
    }
  } catch {
    return null
  }
}

function getInitialAuthState() {
  const storedToken = localStorage.getItem('token')
  if (!storedToken) {
    return { token: null as string | null, user: null as AuthUser | null }
  }

  const mappedUser = mapTokenToUser(storedToken)
  if (!mappedUser) {
    localStorage.removeItem('token')
    return { token: null as string | null, user: null as AuthUser | null }
  }

  return { token: storedToken, user: mappedUser }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = getInitialAuthState()
  const [token, setToken] = useState<string | null>(initialState.token)
  const [user, setUser] = useState<AuthUser | null>(initialState.user)

  const login = (newToken: string) => {
    const mappedUser = mapTokenToUser(newToken)
    if (!mappedUser) return

    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(mappedUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}