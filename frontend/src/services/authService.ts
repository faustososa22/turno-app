import api from './api'
import type { AuthResponse } from '@/types'

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const register = async (nombre: string, apellido: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/registro', { nombre, apellido, email, password })
  return response.data
}