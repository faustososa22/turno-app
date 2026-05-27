import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { Turno } from "../types";
import { turnoService } from "../services/turnos";
import { Badge, Button, Col, Container, Form, Row, Spinner, Table } from "react-bootstrap";
import { AppToast } from "../components/AppToast";
import { ConfirmModal } from "../components/ConfirmModal";
import { estadoVariant, pagoVariant } from "../utils/badges";

export function TurnosBarbero(){
    const {user} = useAuth()
    const [turnos, setTurnos] = useState<Turno[]>([])
    const [loading, setLoading] = useState(true)
    const [fecha, setFecha] = useState('')
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'danger' } | null>(null)
    const [turnoAConfirmar, setTurnoAConfirmar] = useState<number | null>(null)

    const cargarTurnos = async (f: string) => {
        setLoading(true)
        try {
            const data = await turnoService.getMisTurnosBarbero(f || undefined)
            setTurnos(data)
        } catch {
            setToast({ message: 'Could not load your appointments', variant: 'danger' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) return
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

    const onConfirmar = async (id: number) => {
        try {
            await turnoService.confirmarTurno(id)
            await cargarTurnos(fecha)
            setToast({ message: 'Appointment confirmed', variant: 'success' })
        } catch {
            setToast({ message: 'Could not confirm the appointment', variant: 'danger' })
        }
    }

    const onMarcarPagado = async (id: number) => {
        try {
            await turnoService.marcarPagado(id)
            await cargarTurnos(fecha)
            setToast({ message: 'Appointment marked as paid', variant: 'success' })
        } catch {
            setToast({ message: 'Could not mark as paid', variant: 'danger' })
        }
    }

    const pendientes = turnos.filter(t => t.estado === 'pendiente').length
    const confirmados = turnos.filter(t => t.estado === 'confirmado').length

    return(
        <div className="page-wrapper">
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

            <div className="page-header">
                <Container fluid className="px-4">
                    <p className="page-header-label">Barber panel</p>
                    <h2>My appointments</h2>
                </Container>
            </div>

            <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
                <Row className="g-3 mb-4">
                    <Col xs={6} md={4}>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div className="stat-number">{pendientes}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </Col>
                    <Col xs={6} md={4}>
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            <div className="stat-number">{confirmados}</div>
                            <div className="stat-label">Confirmed</div>
                        </div>
                    </Col>
                </Row>

                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <Form.Control
                            type="date"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        />
                        {fecha && (
                            <Button variant="outline-secondary" size="sm" onClick={() => setFecha('')}>
                                Clear
                            </Button>
                        )}
                        <span className="ms-auto" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {fecha ? `${turnos.length} result(s)` : 'Upcoming appointments'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--gold)' }} /></div>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 border-0">Date</th>
                                    <th className="py-3 border-0">Client</th>
                                    <th className="py-3 border-0">Service</th>
                                    <th className="py-3 border-0">Status</th>
                                    <th className="py-3 border-0">Payment</th>
                                    <th className="py-3 border-0">Price</th>
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
                                        <td className="py-3" style={{ fontSize: '14px' }}>{t.cliente}</td>
                                        <td className="py-3" style={{ fontSize: '14px' }}>{t.servicios && t.servicios.length > 0 ? t.servicios.join(', ') : t.servicio}</td>
                                        <td className="py-3">
                                            <Badge bg={estadoVariant(t.estado)} className="text-capitalize" style={{ fontSize: '12px' }}>{t.estado}</Badge>
                                        </td>
                                        <td className="py-3">
                                            <Badge bg={pagoVariant(t.estadoPago)} className="text-capitalize" style={{ fontSize: '12px' }}>{t.estadoPago}</Badge>
                                        </td>
                                        <td className="py-3" style={{ fontSize: '14px', fontWeight: 600 }}>${t.precioTotal ?? '-'}</td>
                                        <td className="py-3">
                                            <div className="d-flex gap-2">
                                                {t.estado === 'pendiente' && (
                                                    <Button size="sm" variant="success" onClick={() => onConfirmar(t.id)}>Confirm</Button>
                                                )}
                                                {t.estado !== 'cancelado' && t.estadoPago === 'pendiente' && (
                                                    <Button size="sm" variant="primary" onClick={() => onMarcarPagado(t.id)}>Paid</Button>
                                                )}
                                                <Button size="sm" variant="outline-danger" onClick={() => setTurnoAConfirmar(t.id)} disabled={t.estado === 'cancelado'}>Cancel</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {turnos.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                                        {fecha ? 'No appointments for that date.' : 'No upcoming appointments.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </div>
            </Container>
        </div>
    )
}
