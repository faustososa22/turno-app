import { apiClient } from '../api/client'
import type { Servicio } from '../types'

interface ServicioPayload {
  nombre: string
  descripcion: string
  duracionMinutos: number
  precio: number
  tipo: string
}

export const serviciosService = {
  async getAll() {
    const { data } = await apiClient.get<Servicio[]>('/api/Servicios')
    return data
  },

  async getDesactivados() {
    const { data } = await apiClient.get<Servicio[]>('/api/Servicios/disabled')
    return data
  },

  async getByBarbero(barberoId: number) {
    const { data } = await apiClient.get<Servicio[]>(`/api/Servicios/barbero/${barberoId}`)
    return data
  },

  async crear(payload: ServicioPayload) {
    const { data } = await apiClient.post<Servicio>('/api/Servicios', payload)
    return data
  },

  async actualizar(id: number, payload: ServicioPayload) {
    await apiClient.put(`/api/Servicios/${id}`, payload)
  },

  async desactivar(id: number) {
    await apiClient.delete(`/api/Servicios/${id}`)
  },

  async reactivar(id: number) {
    await apiClient.patch(`/api/Servicios/${id}/reactivar`)
  },
}