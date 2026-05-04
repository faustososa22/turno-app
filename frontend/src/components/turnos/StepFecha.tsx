import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

interface StepFechaProps {
  fecha: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export default function StepFecha({ fecha, onSelect }: StepFechaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2 — Selecciona una fecha</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={fecha}
          onSelect={onSelect}
          disabled={{ before: new Date() }}
        />
      </CardContent>
    </Card>
  )
}