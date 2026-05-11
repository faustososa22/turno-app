import { apiClient } from '../api/client'
import type { Barbero } from '../types'

interface BarberoCrearPayload {
  nombre: string
  apellido: string
  telefono: string
  email: string
  password: string
  fotoUrl?: string
}

interface BarberoUpdatePayload {
  nombre: string
  apellido: string
  telefono: string
  fotoUrl?: string
}

export const barberosService = {
  async getActivos() {
    const { data } = await apiClient.get<Barbero[]>('/api/Barberos')
    return data
  },

  async getInactivos() {
    const { data } = await apiClient.get<Barbero[]>('/api/Barberos/inactivos')
    return data
  },

  async crear(payload: BarberoCrearPayload) {
    const { data } = await apiClient.post<Barbero>('/api/Barberos', payload)
    return data
  },

  async actualizar(id: number, payload: BarberoUpdatePayload) {
    await apiClient.put(`/api/Barberos/${id}`, payload)
  },

  async desactivar(id: number) {
    await apiClient.delete(`/api/Barberos/${id}`)
  },

  async reactivar(id: number) {
    await apiClient.patch(`/api/Barberos/${id}/reactivar`)
  },

  async agregarServicio(barberoId: number, servicioId: number) {
    await apiClient.post(`/api/Barberos/${barberoId}/servicios/${servicioId}`)
  },

  async quitarServicio(barberoId: number, servicioId: number) {
    await apiClient.delete(`/api/Barberos/${barberoId}/servicios/${servicioId}`)
  },
}
