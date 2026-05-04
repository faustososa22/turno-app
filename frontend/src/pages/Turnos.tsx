import { useEffect, useState } from 'react'
import { type Barbero, type Servicio, type HuecoDisponible } from '@/types'
import { getBarberos } from '@/services/barberoService'
import { getServiciosByBarbero } from '@/services/servicioService'
import { getHuecosDisponibles } from '@/services/horarioService'
import { getTimezone } from '@/services/configService'
import { crearTurno } from '@/services/turnoService'
import { useNavigate } from 'react-router-dom'
import { StepBarbero, StepFecha, StepServicios, StepHorario, StepConfirmar } from '@/components/turnos'

export default function Turnos() {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<Barbero | null>(null)
  const [fecha, setFecha] = useState<Date | undefined>(undefined)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [servicioBase, setServicioBase] = useState<Servicio | null>(null)
  const [addonsSeleccionados, setAddonsSeleccionados] = useState<Servicio[]>([])
  const [huecos, setHuecos] = useState<HuecoDisponible[]>([])
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null)
  const [timezone, setTimezone] = useState<string>('Europe/Dublin')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const duracionTotal = (servicioBase?.duracionMinutos ?? 0) + 
    addonsSeleccionados.reduce((acc, addon) => acc + addon.duracionMinutos, 0)

  const precioTotal = (servicioBase?.precio ?? 0) + 
    addonsSeleccionados.reduce((acc, addon) => acc + addon.precio, 0)

  useEffect(() => {
    getBarberos().then(setBarberos)
  }, [])

  useEffect(()=> {
    getTimezone().then(data => setTimezone(data))
  }, [])

  useEffect(() => {
    if (!barberoSeleccionado) return
    getServiciosByBarbero(barberoSeleccionado.id).then(setServicios)
  }, [barberoSeleccionado])

  useEffect(() => {
    if (!barberoSeleccionado || !fecha || duracionTotal === 0) return
    
    getHuecosDisponibles(barberoSeleccionado.id, fecha, duracionTotal)
      .then(setHuecos)
  }, [barberoSeleccionado, fecha, duracionTotal])

  const toggleAddon = (servicio: Servicio) => {
    setAddonsSeleccionados(prev =>
      prev.some(a => a.id === servicio.id)
        ? prev.filter(a => a.id !== servicio.id)
        : [...prev, servicio]
    )
  }

  const handleConfirmar = async () => {
    if (!barberoSeleccionado || !fecha || !horarioSeleccionado || !servicioBase) return
    
    setLoading(true)
    try {
      const [hora, min] = horarioSeleccionado.split(':')
      const year = fecha.getFullYear()
      const mes = String(fecha.getMonth() + 1).padStart(2, '0')
      const dia = String(fecha.getDate()).padStart(2, '0')
      const horaStr = hora.padStart(2, '0')
      const minStr = min
      const fechaHora = `${year}-${mes}-${dia}T${horaStr}:${minStr}:00`
      const addonIds = addonsSeleccionados.map(a => a.id)
      
      await crearTurno(barberoSeleccionado.id, servicioBase.id, addonIds, fechaHora)
      navigate('/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: string } }
      setError(e.response?.data || 'Error al reservar turno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Reservar Turno</h1>
      
      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Step 1: Seleccionar Barbero */}
        <StepBarbero
          barberos={barberos}
          barberoSeleccionado={barberoSeleccionado}
          onSelect={(barbero) => {
            setBarberoSeleccionado(barbero)
            setStep(2)
          }}
        />

        {/* Step 2: Seleccionar Fecha */}
        {step >= 2 && (
          <StepFecha
            fecha={fecha}
            onSelect={(date) => {
              setFecha(date)
              setStep(3)
            }}
          />
        )}

        {/* Step 3: Seleccionar Servicios */}
        {step >= 3 && fecha && (
          <StepServicios
            servicios={servicios}
            servicioBase={servicioBase}
            addonsSeleccionados={addonsSeleccionados}
            onSelectBase={(servicio) => {
              setServicioBase(servicio)
              setStep(4)
            }}
            onToggleAddon={toggleAddon}
          />
        )}

        {/* Step 4: Seleccionar Horario */}
        {step >= 4 && duracionTotal > 0 && (
          <StepHorario
            huecos={huecos}
            horarioSeleccionado={horarioSeleccionado}
            duracionTotal={duracionTotal}
            onSelect={(hora) => {
              setHorarioSeleccionado(hora)
              setStep(5)
            }}
          />
        )}

        {/* Step 5: Confirmar */}
        {step >= 5 && horarioSeleccionado && (
          <StepConfirmar
            barberoSeleccionado={barberoSeleccionado}
            fecha={fecha}
            horarioSeleccionado={horarioSeleccionado}
            servicioBase={servicioBase}
            addonsSeleccionados={addonsSeleccionados}
            duracionTotal={duracionTotal}
            precioTotal={precioTotal}
            error={error}
            loading={loading}
            timezone={timezone}
            onConfirm={handleConfirmar}
            onBack={() => setStep(4)}
          />
        )}

      </div>
    </div>
  )
}