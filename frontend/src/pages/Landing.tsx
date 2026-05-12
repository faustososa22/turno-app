import { useAuth } from '../auth/useAuth'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'

export function Landing() {
    const { user } = useAuth()
    const navigate = useNavigate()

    if (user) {
        if (user.rol === 'admin') return <Navigate to="/admin" replace />
        if (user.rol === 'barbero') return <Navigate to="/turnos-barbero" replace />
        return <Navigate to="/mis-turnos" replace />
    }

    return (
        <>
            {/* Hero */}
            <div
                className="d-flex align-items-center text-white"
                style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                    minHeight: '92vh',
                }}
            >
                <Container className="py-5 text-center">
                    <h1 className="display-2 fw-bold mb-3">BarberShop</h1>
                    <p className="lead fs-4 mb-2 text-white-50">
                        Your next haircut, one click away.
                    </p>
                    <p className="mb-5 text-white-50">
                        Book online, choose your barber, and forget about waiting.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Button
                            size="lg"
                            variant="light"
                            className="px-5 fw-semibold"
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
                </Container>
            </div>

            {/* Cómo funciona */}
            <Container className="py-5 my-3">
                <h2 className="text-center fw-bold mb-2">How it works</h2>
                <p className="text-center text-muted mb-5">Three steps and done.</p>
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">📅</div>
                                <Card.Title className="fw-bold fs-5">Book online</Card.Title>
                                <Card.Text className="text-muted">
                                    Choose the day and time that works best for you, from anywhere.
                                    No calls, no messages.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">✂️</div>
                                <Card.Title className="fw-bold fs-5">Choose your barber</Card.Title>
                                <Card.Text className="text-muted">
                                    Select your trusted barber and the services you want,
                                    including add-ons like beard or eyebrows.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">⚡</div>
                                <Card.Title className="fw-bold fs-5">No waiting</Card.Title>
                                <Card.Text className="text-muted">
                                    Show up at your time and you're done. No lines, no surprises.
                                    The barber already knows you're coming.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* CTA final */}
            <div className="bg-dark text-white">
                <Container className="py-5 text-center">
                    <h2 className="fw-bold mb-3">Ready for your next haircut?</h2>
                    <p className="text-white-50 mb-4 fs-5">
                        Create your free account and book in less than 2 minutes.
                    </p>
                    <Button
                        size="lg"
                        variant="light"
                        className="px-5 fw-semibold"
                        onClick={() => navigate('/register')}
                    >
                        Get started →
                    </Button>
                </Container>
            </div>

            {/* Footer mínimo */}
            <div className="bg-dark border-top border-secondary">
                <Container className="py-3 text-center">
                    <small className="text-secondary">© 2025 BarberShop — All rights reserved</small>
                </Container>
            </div>
        </>
    )
}
