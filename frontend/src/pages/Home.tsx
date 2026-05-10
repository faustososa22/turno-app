import { Container } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function Home() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (user.rol === 'admin') return <Navigate to="/admin" replace />
  if (user.rol === 'barbero') return <Navigate to="/turnos-barbero" replace />
  return <Navigate to="/mis-turnos" replace />
}

export function Placeholder({ titulo }: { titulo: string }) {
  return (
    <Container fluid className="py-5">
      <h2>{titulo}</h2>
      <p>Próximamente.</p>
    </Container>
  )
}