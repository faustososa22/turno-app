import api from './api'
import type { Barbero, HorarioDisponible } from '@/types'

export const getBarberos = async (): Promise<Barbero[]> => {
  const response = await api.get('/barberos')
  return response.data
}

export const getHorariosDisponibles = async (fecha: string): Promise<HorarioDisponible[]> => {
  const response = await api.get(`/horarios/disponibles?fecha=${fecha}`)
  return response.data
}