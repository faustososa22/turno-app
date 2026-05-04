import api from './api'

export const crearTurno = async (
  barberoId: number, 
  servicioBaseId: number, 
  addonIds: number[], 
  fechaHora: string
) => {
  const response = await api.post('/turnos', { 
    barberoId, 
    servicioBaseId, 
    addonIds,
    fechaHora 
  })
  return response.data
}