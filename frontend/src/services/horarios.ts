import { apiClient } from '../api/client'
import type { HorarioDisponible, HuecoDisponible } from '../types'

interface GetHuecosParams {
  barberoId: number
  anio: number
  mes: number
  dia: number
  duracionMinutos: number
}

interface HorarioPayload {
  diaSemana: string
  horaInicio: string
  horaFin: string
  barberoId: number
}

export const horariosService = {
  async getHuecos(params: GetHuecosParams) {
    const { data } = await apiClient.get<HuecoDisponible[]>('/api/Horarios/huecos', { params })
    return data
  },

  async getByBarbero(barberoId: number) {
    const { data } = await apiClient.get<HorarioDisponible[]>(`/api/Horarios/barbero/${barberoId}`)
    return data
  },

  async crear(payload: HorarioPayload) {
    const { data } = await apiClient.post<HorarioDisponible>('/api/Horarios', payload)
    return data
  },

  async actualizar(id: number, payload: HorarioPayload) {
    await apiClient.put(`/api/Horarios/${id}`, payload)
  },

  async eliminar(id: number) {
    await apiClient.delete(`/api/Horarios/${id}`)
  },
}
