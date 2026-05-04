import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Barbero, type Servicio } from '@/types'

interface StepConfirmarProps {
  barberoSeleccionado: Barbero | null
  fecha: Date | undefined
  horarioSeleccionado: string | null
  servicioBase: Servicio | null
  addonsSeleccionados: Servicio[]
  duracionTotal: number
  precioTotal: number
  error: string
  loading: boolean
  timezone: string
  onConfirm: () => void
  onBack: () => void
}

export default function StepConfirmar({
  barberoSeleccionado,
  fecha,
  horarioSeleccionado,
  servicioBase,
  addonsSeleccionados,
  duracionTotal,
  precioTotal,
  error,
  loading,
  timezone,
  onConfirm,
  onBack
}: StepConfirmarProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5 — Confirmar turno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Barbero:</span> {barberoSeleccionado?.nombre} {barberoSeleccionado?.apellido}</p>
          <p><span className="font-medium">Fecha:</span> {fecha?.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone })}</p>
          <p><span className="font-medium">Hora:</span> {horarioSeleccionado}</p>
          <p><span className="font-medium">Servicio:</span> {servicioBase?.nombre}</p>
          {addonsSeleccionados.length > 0 && (
            <div>
              <p className="font-medium">Complementos:</p>
              <ul className="ml-4 text-muted-foreground">
                {addonsSeleccionados.map(addon => (
                  <li key={addon.id}>+ {addon.nombre}</li>
                ))}
              </ul>
            </div>
          )}
          <p><span className="font-medium">Duración total:</span> {duracionTotal} min</p>
          <p><span className="font-medium">Precio total:</span> <span className="text-lg font-bold">${precioTotal}</span></p>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Atrás
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="flex-1">
            {loading ? 'Reservando...' : 'Confirmar Turno'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}