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
                        Tu próximo corte, a un click de distancia.
                    </p>
                    <p className="mb-5 text-white-50">
                        Reservá online, elegí tu barbero y olvidate de las esperas.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Button
                            size="lg"
                            variant="light"
                            className="px-5 fw-semibold"
                            onClick={() => navigate('/register')}
                        >
                            Reservar turno
                        </Button>
                        <Button
                            size="lg"
                            variant="outline-light"
                            className="px-5"
                            onClick={() => navigate('/login')}
                        >
                            Iniciar sesión
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Cómo funciona */}
            <Container className="py-5 my-3">
                <h2 className="text-center fw-bold mb-2">¿Cómo funciona?</h2>
                <p className="text-center text-muted mb-5">Tres pasos y listo.</p>
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">📅</div>
                                <Card.Title className="fw-bold fs-5">Reservá online</Card.Title>
                                <Card.Text className="text-muted">
                                    Elegí el día y horario que mejor te quede, desde donde estés.
                                    Sin llamadas, sin mensajes.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">✂️</div>
                                <Card.Title className="fw-bold fs-5">Elegí tu barbero</Card.Title>
                                <Card.Text className="text-muted">
                                    Seleccioná el barbero de tu confianza y los servicios que querés,
                                    incluyendo add-ons como barba o cejas.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <Card.Body className="p-4">
                                <div style={{ fontSize: '2.8rem' }} className="mb-3">⚡</div>
                                <Card.Title className="fw-bold fs-5">Sin esperas</Card.Title>
                                <Card.Text className="text-muted">
                                    Llegá a tu horario y listo. Sin filas, sin sorpresas.
                                    El barbero ya sabe que venís.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* CTA final */}
            <div className="bg-dark text-white">
                <Container className="py-5 text-center">
                    <h2 className="fw-bold mb-3">¿Listo para tu próximo corte?</h2>
                    <p className="text-white-50 mb-4 fs-5">
                        Creá tu cuenta gratis y reservá en menos de 2 minutos.
                    </p>
                    <Button
                        size="lg"
                        variant="light"
                        className="px-5 fw-semibold"
                        onClick={() => navigate('/register')}
                    >
                        Empezar ahora →
                    </Button>
                </Container>
            </div>

            {/* Footer mínimo */}
            <div className="bg-dark border-top border-secondary">
                <Container className="py-3 text-center">
                    <small className="text-secondary">© 2025 BarberShop — Todos los derechos reservados</small>
                </Container>
            </div>
        </>
    )
}
