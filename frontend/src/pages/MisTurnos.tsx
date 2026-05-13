import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { Turno } from "../types";
import { turnoService } from "../services/turnos";
import { Badge, Button, Card, Container, Form, Spinner, Table } from "react-bootstrap";
import { AppToast } from "../components/AppToast";
import { ConfirmModal } from "../components/ConfirmModal";
import { estadoVariant } from "../utils/badges";
import { useNavigate } from "react-router-dom";

export function MisTurnos(){
    const {user} = useAuth()
    const navigate = useNavigate()
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
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
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

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
                color: 'white',
                padding: '40px 0 64px',
            }}>
                <Container fluid className="px-4">
                    <p className="text-white-50 mb-1" style={{ fontSize: '14px' }}>My account</p>
                    <h2 className="fw-bold mb-0">My appointments</h2>
                </Container>
            </div>

            <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="px-4 py-3 border-bottom d-flex align-items-center gap-3 flex-wrap">
                            <Form.Control
                                type="date"
                                value={fecha}
                                onChange={e => setFecha(e.target.value)}
                                style={{ maxWidth: '200px' }}
                            />
                            {fecha && (
                                <Button variant="outline-secondary" size="sm" onClick={() => setFecha('')}>Clear</Button>
                            )}
                            <Button variant="primary" size="sm" className="ms-auto" onClick={() => navigate('/nuevo-turno')}>
                                + Book appointment
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" /></div>
                        ) : (
                            <Table hover responsive className="mb-0">
                                <thead style={{ background: '#f8f9fa' }}>
                                    <tr>
                                        <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Date</th>
                                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Barber</th>
                                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Service</th>
                                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Status</th>
                                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Price</th>
                                        <th className="py-3 border-0"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turnos.map((t) => (
                                        <tr key={t.id} style={{ verticalAlign: 'middle' }}>
                                            <td className="px-4 py-3" style={{ fontSize: '14px' }}>
                                                {new Date(t.fechaHora).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-3" style={{ fontSize: '14px' }}>{t.barbero}</td>
                                            <td className="py-3" style={{ fontSize: '14px' }}>{t.servicios && t.servicios.length > 0 ? t.servicios.join(', ') : t.servicio}</td>
                                            <td className="py-3">
                                                <Badge bg={estadoVariant(t.estado)} className="text-capitalize" style={{ fontSize: '12px' }}>{t.estado}</Badge>
                                            </td>
                                            <td className="py-3 fw-semibold" style={{ fontSize: '14px' }}>${t.precioTotal ?? '-'}</td>
                                            <td className="py-3">
                                                <Button size="sm" variant="outline-danger"
                                                    onClick={() => setTurnoAConfirmar(t.id)}
                                                    disabled={t.estado === 'cancelado'}>
                                                    Cancel
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {turnos.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-5 text-muted">
                                            {fecha ? 'No appointments for that date.' : 'You have no upcoming appointments.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}
