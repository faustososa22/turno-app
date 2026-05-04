export interface Usuario {
    id: number
    nombre: string
    apellido: string
    email: string
    rol: string
    activo: boolean
  }
  
  export interface Barbero {
    id: number
    nombre: string
    apellido: string
    telefono: string
    fotoUrl?: string
    email: string
    activo: boolean
  }
  
  export interface Servicio {
    id: number
    nombre: string
    descripcion: string
    duracionMinutos: number
    precio: number
    activo: boolean
    tipo: string // 👈 agregamos esto
  }
  
  export interface HorarioDisponible {
    id: number
    diaSemana: string
    horaInicio: string
    horaFin: string
    barberoId: number
    barberoNombre: string
  }
  
  export interface Turno {
    id: number
    fechaHora: string
    fechaHoraFin: string
    estado: string
    barbero: string
    cliente: string
    servicio: string
  }
  
  export interface AuthResponse {
    token: string
  }