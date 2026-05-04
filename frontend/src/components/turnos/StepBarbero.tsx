import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Barbero } from '@/types'
import { User } from 'lucide-react'

interface StepBarberoProps {
  barberos: Barbero[]
  barberoSeleccionado: Barbero | null
  onSelect: (barbero: Barbero) => void
}

export default function StepBarbero({ barberos, barberoSeleccionado, onSelect }: StepBarberoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Step 1 — Selecciona un barbero
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {barberos.map(barbero => (
            <div
              key={barbero.id}
              onClick={() => onSelect(barbero)}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors
                ${barberoSeleccionado?.id === barbero.id ? 'border-primary bg-accent' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {barbero.fotoUrl ? (
                    <img src={barbero.fotoUrl} alt={barbero.nombre} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{barbero.nombre} {barbero.apellido}</p>
                </div>
              </div>
            </div>
          ))}
          {barberos.length === 0 && (
            <p className="text-muted-foreground text-center col-span-2">No hay barberos disponibles</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}