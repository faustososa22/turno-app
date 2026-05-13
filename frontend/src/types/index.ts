export type Rol = 'admin' | 'barbero' | 'cliente'

export interface JwtPayload {
  nameid?: string
  email?: string
  role?: Rol
  unique_name?: string
  exp?: number
  iss?: string
  aud?: string
  [key: string]: unknown
}

export interface AuthUser {
  id: number
  email: string
  rol: Rol
  nombre: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegistroRequest {
  nombre: string
  apellido: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
}

export interface Barbero {
  id: number
  nombre: string
  apellido: string
  telefono: string
  fotoUrl?: string | null
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
  tipo: 'base' | 'addon' | string
}

export interface Turno {
  id: number
  fechaHora: string
  fechaHoraFin?: string
  barbero: string
  cliente: string
  estado: string
  estadoPago: string
  servicio: string
  duracionMinutos?: number
  precioTotal?: number
  servicios?: string[]
}

export interface CrearTurnoRequest {
  barberoId: number
  servicioBaseId: number
  addonIds: number[]
  fechaHora: string
}

export interface HorarioDisponible {
  id: number
  diaSemana: string
  horaInicio: string
  horaFin: string
  barberoId?: number
  barberoNombre?: string
}

export interface HuecoDisponible {
  hora: string
  disponible: boolean
}

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  activo: boolean
}