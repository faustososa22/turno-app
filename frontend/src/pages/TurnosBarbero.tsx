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
            setToast({ message: 'No se pudieron cargar tus turnos', variant: 'danger' })
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
            setToast({ message: 'Turno cancelado', variant: 'danger' })
        } catch {
            setToast({ message: 'No se pudo cancelar el turno', variant: 'danger' })
        } finally {
            setTurnoAConfirmar(null)
        }
    }

    const onConfirmar = async (id: number) => {
        try {
            await turnoService.confirmarTurno(id)
            await cargarTurnos(fecha)
            setToast({ message: 'Turno confirmado', variant: 'success' })
        } catch {
            setToast({ message: 'No se pudo confirmar el turno', variant: 'danger' })
        }
    }

    const onMarcarPagado = async (id: number) => {
        try {
            await turnoService.marcarPagado(id)
            await cargarTurnos(fecha)
            setToast({ message: 'Turno marcado como pagado', variant: 'success' })
        } catch {
            setToast({ message: 'No se pudo marcar como pagado', variant: 'danger' })
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
                titulo="Cancelar turno"
                mensaje="¿Seguro que querés cancelar este turno? Esta acción no se puede deshacer."
                labelConfirmar="Sí, cancelar"
                onConfirmar={onCancelar}
                onCancelar={() => setTurnoAConfirmar(null)}
            />

            <h2 className="mb-3">Turnos del barbero</h2>

            <Row className="mb-3 align-items-end g-2">
                <Col xs="auto">
                    <Form.Label className="mb-1">Filtrar por fecha</Form.Label>
                    <Form.Control
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />
                </Col>
                {fecha && (
                    <Col xs="auto">
                        <Button variant="outline-secondary" onClick={() => setFecha('')}>
                            Ver todos
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
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Estado</th>
                            <th>Pago</th>
                            <th>Precio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.map((t) => (
                            <tr key={t.id}>
                                <td>{new Date(t.fechaHora).toLocaleString()}</td>
                                <td>{t.cliente}</td>
                                <td>{t.servicios && t.servicios.length > 0 ? t.servicios.join(', ') : t.servicio}</td>
                                <td>
                                    <Badge bg={estadoVariant(t.estado)} className="text-capitalize">
                                        {t.estado}
                                    </Badge>
                                </td>
                                <td>
                                    <Badge bg={pagoVariant(t.estadoPago)} className="text-capitalize">
                                        {t.estadoPago}
                                    </Badge>
                                </td>
                                <td>${t.precioTotal ?? '-'}</td>
                                <td className="d-flex gap-2">
                                    {t.estado === 'pendiente' && (
                                        <Button size="sm" variant="outline-success"
                                            onClick={() => onConfirmar(t.id)}>
                                            Confirmar
                                        </Button>
                                    )}
                                    {t.estado !== 'cancelado' && t.estadoPago === 'pendiente' && (
                                        <Button size="sm" variant="outline-primary"
                                            onClick={() => onMarcarPagado(t.id)}>
                                            Pagado
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline-danger"
                                        onClick={() => setTurnoAConfirmar(t.id)}
                                        disabled={t.estado === 'cancelado'}>
                                        Cancelar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {turnos.length === 0 && (
                            <tr>
                                <td colSpan={7}>
                                    {fecha ? 'No hay turnos para esa fecha.' : 'No tenés turnos próximos.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    )
}
