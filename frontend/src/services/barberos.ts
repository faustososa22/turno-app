import { apiClient } from '../api/client'
import type { Barbero } from '../types'

export const barberosService = {
  async getActivos() {
    const { data } = await apiClient.get<Barbero[]>('/api/Barberos')
    return data
  },
}