import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type HuecoDisponible } from '@/types'

interface StepHorarioProps {
  huecos: HuecoDisponible[]
  horarioSeleccionado: string | null
  duracionTotal: number
  onSelect: (hora: string) => void
}

export default function StepHorario({ 
  huecos, 
  horarioSeleccionado, 
  duracionTotal, 
  onSelect 
}: StepHorarioProps) {
  
  const huecosDisponibles = huecos.filter(h => h.disponible)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4 — Selecciona un horario</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Duración total del servicio: {duracionTotal} minutos
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {huecosDisponibles.map(hueco => (
            <button
              key={hueco.hora}
              onClick={() => onSelect(hueco.hora)}
              className={`p-3 rounded-lg text-center transition-colors border hover:bg-accent
                ${horarioSeleccionado === hueco.hora ? 'border-primary bg-accent' : ''}`}
            >
              {hueco.hora}
            </button>
          ))}
          {huecosDisponibles.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center">
              No hay horarios disponibles para esta fecha
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}