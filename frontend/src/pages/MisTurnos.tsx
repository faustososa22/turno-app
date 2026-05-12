import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { Turno } from "../types";
import { turnoService } from "../services/turnos";
import { Badge, Button, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { AppToast } from "../components/AppToast";
import { ConfirmModal } from "../components/ConfirmModal";
import { estadoVariant } from "../utils/badges";

export function MisTurnos(){
    const {user} = useAuth()
    const [turnos, setTurnos] = useState<Turno[]>([])
    const [loading, setLoading] = useState(true)
    const [fecha, setFecha] = useState('')
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null)
    const [turnoAConfirmar, setTurnoAConfirmar] = useState<number | null>(null)

    const cargarTurnos = async (f: string) => {
        if (!user) return
        setLoading(true)
        try {
            const data = await turnoService.getTurnosCliente(user.id, f || undefined)
            setTurnos(data)
        } catch {
            setToast({ message: 'Could not load your appointments', variant: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void cargarTurnos(fecha)
    }, [user, fecha])

    const onCancelar = async () => {
        if (turnoAConfirmar === null) return
        try {
            await turnoService.cancelarTurno(turnoAConfirmar)
            await cargarTurnos(fecha)
            setToast({ message: 'Appointment cancelled', variant: 'danger' })
        } catch {
            setToast({ message: 'Could not cancel the appointment', variant: 'danger' })
        } finally {
            setTurnoAConfirmar(null)
        }
    }

    return(
        <Container fluid className="py-4">
            <AppToast
                show={toast !== null}
                message={toast?.message ?? ''}
                variant={toast?.variant}
                onClose={() => setToast(null)}
            />

            <ConfirmModal
                show={turnoAConfirmar !== null}
                titulo="Cancel appointment"
                mensaje="Are you sure you want to cancel this appointment? This action cannot be undone."
                labelConfirmar="Yes, cancel"
                onConfirmar={onCancelar}
                onCancelar={() => setTurnoAConfirmar(null)}
            />

            <h2 className="mb-3">My appointments</h2>

            <Row className="mb-3 align-items-end g-2">
                <Col xs="auto">
                    <Form.Label className="mb-1">Filter by date</Form.Label>
                    <Form.Control
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />
                </Col>
                {fecha && (
                    <Col xs="auto">
                        <Button variant="outline-secondary" onClick={() => setFecha('')}>
                            View all
                        </Button>
                    </Col>
                )}
            </Row>

            {loading ? (
                <Spinner animation="border"/>
            ): (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Barber</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.map((t) => (
                            <tr key={t.id}>
                                <td>{new Date(t.fechaHora).toLocaleString()}</td>
                                <td>{t.barbero}</td>
                                <td>{t.servicios && t.servicios.length > 0 ? t.servicios.join(', ') : t.servicio}</td>
                                <td>
                                    <Badge bg={estadoVariant(t.estado)} className="text-capitalize">
                                        {t.estado}
                                    </Badge>
                                </td>
                                <td>${t.precioTotal ?? '-'}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => setTurnoAConfirmar(t.id)}
                                        disabled={t.estado === 'cancelado'}
                                    >
                                        Cancel
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {turnos.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    {fecha ? 'No appointments for that date.' : 'You have no upcoming appointments.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    )
}
