import { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { turnoService } from '../services/turnos'
import { estadoVariant } from '../utils/badges'
import type { Turno } from '../types'

export function ClientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [proximoTurno, setProximoTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      if (!user) return
      try {
        const data = await turnoService.getTurnosCliente(user.id)
        const pendientes = data.filter(t => t.estado !== 'cancelado')
        setProximoTurno(pendientes[0] ?? null)
      } catch {
        // silently fail — the welcome page still works without the appointment
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [user])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        color: 'white',
        padding: '48px 0 64px',
      }}>
        <Container>
          <p className="mb-1 text-white-50">{today}</p>
          <h1 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>
            Welcome back{user?.nombre ? `, ${user.nombre}` : ''} 👋
          </h1>
        </Container>
      </div>

      <Container style={{ marginTop: '-32px' }}>
        <Row className="g-4">
          {/* Next appointment card */}
          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '12px' }}>
                  Next appointment
                </h6>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : proximoTurno ? (
                  <>
                    <p className="fw-bold fs-5 mb-1">{proximoTurno.barbero}</p>
                    <p className="text-muted mb-2">
                      {proximoTurno.servicios?.join(', ') ?? proximoTurno.servicio}
                    </p>
                    <p className="mb-3">
                      📅 {new Date(proximoTurno.fechaHora).toLocaleString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <Badge bg={estadoVariant(proximoTurno.estado)} className="text-capitalize">
                      {proximoTurno.estado}
                    </Badge>
                  </>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-muted mb-3">No upcoming appointments</p>
                    <Button variant="primary" onClick={() => navigate('/nuevo-turno')}>
                      Book now
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick actions */}
          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="p-4">
                <h6 className="text-muted text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '12px' }}>
                  Quick actions
                </h6>
                <div className="d-flex flex-column gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/nuevo-turno')}
                    className="text-start px-4"
                  >
                    ✂️ Book an appointment
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate('/mis-turnos')}
                    className="text-start px-4"
                  >
                    📋 My appointments
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Chat hint */}
          <Col xs={12}>
            <Card className="shadow-sm border-0" style={{ background: '#e8f0fe' }}>
              <Card.Body className="p-4 d-flex align-items-center gap-3">
                <span style={{ fontSize: '2rem' }}>💬</span>
                <div>
                  <p className="fw-bold mb-0">Book via chat</p>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    Use the chat button in the bottom right to book an appointment by just chatting — no forms needed.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
