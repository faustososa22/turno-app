import { useAuth } from '../auth/useAuth'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Col, Container, Row } from 'react-bootstrap'

export function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    if (user.rol === 'admin') return <Navigate to="/admin" replace />
    if (user.rol === 'barbero') return <Navigate to="/turnos-barbero" replace />
    return <Navigate to="/home" replace />
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* Hero */}
      <div style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Container className="py-5">
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <p style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
                Premium Barbershop Booking
              </p>
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.8rem, 7vw, 5rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: '24px',
                color: 'var(--text)',
              }}>
                Your next haircut,<br />
                <span style={{ color: 'var(--gold)' }}>one click away.</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                Book online, choose your barber, and forget about waiting.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  size="lg"
                  variant="primary"
                  className="px-5"
                  style={{ fontWeight: 700, letterSpacing: '0.03em' }}
                  onClick={() => navigate('/register')}
                >
                  Book appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline-light"
                  className="px-5"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* How it works */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '80px 0' }}>
        <Container>
          <div className="text-center mb-5">
            <p style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
              How it works
            </p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '8px' }}>
              Three steps and done.
            </h2>
          </div>
          <Row className="g-4">
            {[
              { num: '01', title: 'Book online', text: 'Choose the day and time that works best for you, from anywhere. No calls, no messages.' },
              { num: '02', title: 'Choose your barber', text: 'Select your trusted barber and the services you want, including add-ons like beard or eyebrows.' },
              { num: '03', title: 'No waiting', text: 'Show up at your time and you\'re done. No lines, no surprises. The barber already knows you\'re coming.' },
            ].map(item => (
              <Col md={4} key={item.num}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '32px',
                  height: '100%',
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold-border)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ color: 'var(--gold)', fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, marginBottom: '16px', opacity: 0.6 }}>
                    {item.num}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{item.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <Container>
          <p style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Ready?
          </p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '16px' }}>
            Ready for your next haircut?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem' }}>
            Create your free account and book in less than 2 minutes.
          </p>
          <Button
            size="lg"
            variant="primary"
            className="px-5"
            style={{ fontWeight: 700 }}
            onClick={() => navigate('/register')}
          >
            Get started →
          </Button>
        </Container>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '24px 0', textAlign: 'center' }}>
        <Container>
          <small style={{ color: 'var(--text-muted)' }}>© 2025 BarberShop — All rights reserved</small>
        </Container>
      </div>
    </div>
  )
}
