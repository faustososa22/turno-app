import { useEffect, useState } from 'react'
import { getServicios } from '@/services/servicioService'
import type { Servicio } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export default function Home() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    getServicios().then(data => setServicios(data))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">BarberApp</h1>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Button variant="outline" onClick={logout}>Logout</Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-4">Premium Barbershop</h2>
        <p className="text-muted-foreground text-lg mb-8">Book your appointment online, quickly and easily.</p>
        {isAuthenticated ? (
          <Button size="lg" asChild>
            <Link to="/turnos">Book Appointment</Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        )}
      </div>

      {/* Servicios */}
      <div className="px-6 pb-20">
        <h3 className="text-2xl font-bold text-center mb-8">Our Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {servicios.map(servicio => (
            <Card key={servicio.id}>
              <CardHeader>
                <CardTitle>{servicio.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{servicio.descripcion}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">${servicio.precio}</span>
                  <span className="text-sm text-muted-foreground">{servicio.duracionMinutos} min</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  )
}