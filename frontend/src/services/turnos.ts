import { apiClient } from "../api/client"
import type { Turno } from "../types"

export const turnoService = {
    async getAdminTurnos(fecha?: string){
        const params = fecha ? { fecha } : {}
        const {data} = await apiClient.get<Turno[]>('/api/Turnos', { params })
        return data
    },

    async getMisTurnosBarbero(fecha?: string){
        const params = fecha ? { fecha } : {}
        const {data} = await apiClient.get<Turno[]>('/api/Turnos/mis-turnos-barbero', { params })
        return data
    },

    async getTurnosCliente(clienteId: number, fecha?: string){
        const params = fecha ? { fecha } : {}
        const {data} = await apiClient.get<Turno[]>(`/api/Turnos/cliente/${clienteId}`, { params })
        return data
    },

    async cancelarTurno(id: number){
        await apiClient.delete(`/api/Turnos/${id}`)
    },

    async crearTurno(payload: {
        barberoId: number
        servicioBaseId: number
        addonIds: number[]
        fechaHora: string
      }) {
        const { data } = await apiClient.post('/api/Turnos', payload)
        return data
      },
    async confirmarTurno(id: number) {
        await apiClient.patch(`/api/Turnos/${id}/confirmar`)
    },
  
    async marcarPagado(id: number) {
        await apiClient.patch(`/api/Turnos/${id}/pago`)
    }
}