import api from './api'

export interface HuecoDisponible {
  hora: string
  disponible: boolean
}

export const getHuecosDisponibles = async (
  barberoId: number,
  fecha: Date,
  duracionMinutos: number
): Promise<HuecoDisponible[]> => {
  const anio = fecha.getFullYear()
  const mes = fecha.getMonth() + 1
  const dia = fecha.getDate()
  const response = await api.get(`/horarios/huecos?barberoId=${barberoId}&anio=${anio}&mes=${mes}&dia=${dia}&duracionMinutos=${duracionMinutos}`)
  return response.data
}