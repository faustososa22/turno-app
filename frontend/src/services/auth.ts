import { apiClient } from '../api/client'
import type { AuthResponse, LoginRequest, RegistroRequest } from '../types'

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await apiClient.post<AuthResponse>('/api/Auth/login', payload)
    return data
  },

  async registro(payload: RegistroRequest) {
    const { data } = await apiClient.post<AuthResponse>('/api/Auth/registro', payload)
    return data
  },
}