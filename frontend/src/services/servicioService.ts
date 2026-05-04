import api from './api'
import type { Servicio } from '@/types'

export const getServicios = async (): Promise<Servicio[]> => {
  const response = await api.get('/servicios')
  return response.data
}

export const getServiciosByBarbero = async (barberoId: number): Promise<Servicio[]> => {
  const response = await api.get(`/servicios/barbero/${barberoId}`)
  return response.data
}