import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Servicio, type HorarioDisponible } from '@/types'
import { getHorariosDisponibles } from '@/services/barberoService'
import { getServicios } from '@/services/servicioService'
import { useNavigate } from 'react-router-dom'
import { crearTurno } from '@/services/turnoService'
import { Button } from '@/components/ui/button'



export default function Turnos() {
  const [fecha, setFecha] = useState<Date | undefined>(undefined)
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponible | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')



  const handleConfirmar = async () => {
    if (!fecha || !horarioSeleccionado || !servicioSeleccionado) return
    
    setLoading(true)
    try {
      const fechaHora = `${fecha.toLocaleDateString('en-IE', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      }).split('/').reverse().join('-')}T${horarioSeleccionado.horaInicio}`
      
      await crearTurno(horarioSeleccionado.barberoId, servicioSeleccionado.id, fechaHora)
      navigate('/mis-turnos')
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking appointment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    if(!fecha) return;
    const fechaString = fecha.toLocaleDateString('en-IE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-')
    getHorariosDisponibles(fechaString).then(data => setHorariosDisponibles(data))
  }, [fecha])

  useEffect(()=> {
    if(!horarioSeleccionado) return;
    getServicios().then(data => setServicios(data))
  },[horarioSeleccionado])

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Book Appointment</h1>
      
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Paso 1 - Elegir fecha */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Select a date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={setFecha}
              disabled={{ before: new Date() }}
            />
          </CardContent>
        </Card>

        {/* Paso 2 - aparece cuando hay fecha */}
        {fecha && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2 — Select a barber</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Showing availability for {fecha.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {horariosDisponibles.map(horario => (
                  <div 
                  key={horario.id}
                  onClick={() => setHorarioSeleccionado(horario)}
                  className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-accent
                    ${horarioSeleccionado?.id === horario.id ? 'border-primary bg-accent' : ''}`}
                  >
                    <span className="font-medium">{horario.barberoNombre}</span>
                    <span className="text-muted-foreground">
                      {horario.horaInicio.slice(0, 5)} - {horario.horaFin.slice(0, 5)}
                    </span>
                    
                  </div>
                ))}
                {horariosDisponibles.length === 0 && (
                  <p className="text-muted-foreground text-center">No barbers available for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Paso 3 - aparece cuando hay barbero seleccionado */}
        {horarioSeleccionado && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3 — Select a service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {servicios.map(servicio => (
                  <div
                    key={servicio.id}
                    onClick={() => setServicioSeleccionado(servicio)}
                    className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-accent
                      ${servicioSeleccionado?.id === servicio.id ? 'border-primary bg-accent' : ''}`}
                  >
                    <div>
                      <p className="font-medium">{servicio.nombre}</p>
                      <p className="text-sm text-muted-foreground">{servicio.duracionMinutos} min</p>
                    </div>
                    <span className="font-bold">${servicio.precio}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Paso 4 - aparece cuando hay barbero seleccionado y servicio */}
        {servicioSeleccionado && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4 — Confirm appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {fecha?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><span className="font-medium">Barber:</span> {horarioSeleccionado?.barberoNombre}</p>
                <p><span className="font-medium">Service:</span> {servicioSeleccionado.nombre}</p>
                <p><span className="font-medium">Duration:</span> {servicioSeleccionado.duracionMinutos} min</p>
                <p><span className="font-medium">Price:</span> ${servicioSeleccionado.precio}</p>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={handleConfirmar} disabled={loading} className="w-full">
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}