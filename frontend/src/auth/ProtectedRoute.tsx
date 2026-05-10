import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Rol } from '../types'

interface ProtectedRouteProps {
  allowedRoles?: Rol[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}