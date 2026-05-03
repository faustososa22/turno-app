import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Turnos() {
  const [fecha, setFecha] = useState<Date | undefined>(undefined)

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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}