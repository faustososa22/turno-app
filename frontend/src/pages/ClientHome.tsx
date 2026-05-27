import { useEffect, useState } from 'react'
import { Badge, Button, Col, Container, Row, Spinner } from 'react-bootstrap'
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
        // silently fail
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
    <div className="page-wrapper">
      <div className="page-header">
        <Container>
          <p className="page-header-label">{today}</p>
          <h2>Welcome back{user?.nombre ? `, ${user.nombre}` : ''}</h2>
        </Container>
      </div>

      <Container style={{ marginTop: '-32px' }}>
        <Row className="g-4">
          <Col lg={6}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', height: '100%' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
                Next appointment
              </p>
              {loading ? (
                <Spinner animation="border" size="sm" style={{ color: 'var(--gold)' }} />
              ) : proximoTurno ? (
                <>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{proximoTurno.barbero}</p>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '14px' }}>
                    {proximoTurno.servicios?.join(', ') ?? proximoTurno.servicio}
                  </p>
                  <p style={{ marginBottom: '14px', fontSize: '14px' }}>
                    {new Date(proximoTurno.fechaHora).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <Badge bg={estadoVariant(proximoTurno.estado)} className="text-capitalize">
                    {proximoTurno.estado}
                  </Badge>
                </>
              ) : (
                <div className="text-center py-3">
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>No upcoming appointments</p>
                  <Button variant="primary" onClick={() => navigate('/nuevo-turno')}>Book now</Button>
                </div>
              )}
            </div>
          </Col>

          <Col lg={6}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', height: '100%' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
                Quick actions
              </p>
              <div className="d-flex flex-column gap-3">
                <Button variant="primary" size="lg" onClick={() => navigate('/nuevo-turno')} className="text-start px-4">
                  ✂️ Book an appointment
                </Button>
                <Button variant="outline-secondary" size="lg" onClick={() => navigate('/mis-turnos')} className="text-start px-4">
                  📋 My appointments
                </Button>
              </div>
            </div>
          </Col>

          <Col xs={12}>
            <div style={{
              background: 'var(--gold-dim)',
              border: '1px solid var(--gold-border)',
              borderRadius: '12px',
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <span style={{ fontSize: '1.8rem' }}>💬</span>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '2px' }}>Book via chat</p>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>
                  Use the chat button in the bottom right to book an appointment by just chatting — no forms needed.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
