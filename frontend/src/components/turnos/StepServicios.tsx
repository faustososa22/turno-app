import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Servicio } from '@/types'
import { Scissors } from 'lucide-react'

interface StepServiciosProps {
  servicios: Servicio[]
  servicioBase: Servicio | null
  addonsSeleccionados: Servicio[]
  onSelectBase: (servicio: Servicio) => void
  onToggleAddon: (servicio: Servicio) => void
}

export default function StepServicios({ 
  servicios, 
  servicioBase, 
  addonsSeleccionados, 
  onSelectBase, 
  onToggleAddon 
}: StepServiciosProps) {
  
  const serviciosBase = servicios.filter(s => s.tipo === 'base')
  const serviciosAddon = servicios.filter(s => s.tipo === 'addon')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          Step 3 — Selecciona los servicios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Servicio principal</h3>
          <div className="grid grid-cols-1 gap-3">
            {serviciosBase.map(servicio => (
              <div
                key={servicio.id}
                onClick={() => onSelectBase(servicio)}
                className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors
                  ${servicioBase?.id === servicio.id ? 'border-primary bg-accent' : ''}`}
              >
                <div>
                  <p className="font-medium">{servicio.nombre}</p>
                  <p className="text-sm text-muted-foreground">{servicio.duracionMinutos} min</p>
                </div>
                <span className="font-bold">${servicio.precio}</span>
              </div>
            ))}
            {serviciosBase.length === 0 && (
              <p className="text-muted-foreground">No hay servicios disponibles</p>
            )}
          </div>
        </div>

        {servicioBase && serviciosAddon.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Complementos (opcional)</h3>
            <div className="grid grid-cols-1 gap-3">
              {serviciosAddon.map(servicio => (
                <div
                  key={servicio.id}
                  onClick={() => onToggleAddon(servicio)}
                  className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors
                    ${addonsSeleccionados.some(a => a.id === servicio.id) ? 'border-primary bg-accent' : ''}`}
                >
                  <div>
                    <p className="font-medium">{servicio.nombre}</p>
                    <p className="text-sm text-muted-foreground">{servicio.duracionMinutos} min</p>
                  </div>
                  <span className="font-bold">+${servicio.precio}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}