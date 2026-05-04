import api from './api'

export const crearTurno = async (barberoId: number, servicioId: number, fechaHora: string) => {
  const response = await api.post('/turnos', { barberoId, servicioId, fechaHora })
  return response.data
}