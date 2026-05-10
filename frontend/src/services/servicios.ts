import { apiClient } from '../api/client'
import type { Servicio } from '../types'

export const serviciosService = {
  async getByBarbero(barberoId: number) {
    const { data } = await apiClient.get<Servicio[]>(`/api/Servicios/barbero/${barberoId}`)
    return data
  },
}