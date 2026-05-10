import { apiClient } from '../api/client'
import type { HuecoDisponible } from '../types'

interface GetHuecosParams {
  barberoId: number
  anio: number
  mes: number
  dia: number
  duracionMinutos: number
}

export const horariosService = {
  async getHuecos(params: GetHuecosParams) {
    const { data } = await apiClient.get<HuecoDisponible[]>('/api/Horarios/huecos', { params })
    return data
  },
}