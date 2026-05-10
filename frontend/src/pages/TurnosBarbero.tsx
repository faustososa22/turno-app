import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { Turno } from "../types";
import { turnoService } from "../services/turnos";
import { Alert, Button, Container, Spinner, Table } from "react-bootstrap";

export function TurnosBarbero(){
    const {user} = useAuth()
    const [turnos, setTurnos] = useState<Turno[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
      
        const cargarTurnos = async () => {
          setLoading(true)
          setError(null)
      
          try {
            const data = await turnoService.getMisTurnosBarbero()
            setTurnos(data)
          } catch {
            setError('No se pudieron cargar tus turnos')
          } finally {
            setLoading(false)
          }
        }
      
        void cargarTurnos()
      }, [user])

    const onCancelar = async (id: number) =>{
        if (!user) return
        try{
            await turnoService.cancelarTurno(id)
            const data = await turnoService.getMisTurnosBarbero()
            setTurnos(data)
        }catch{
            setError('No se pudo cancelar el turno')
        }
    }

    return(
        <Container fluid className="py-4">
            <h2 className="mb-3">Turnos del barbero</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border"/>
            ): (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Barbero</th>
                            <th>Servicio</th>
                            <th>Estado</th>
                            <th>Precio</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.map((t) => (
                            <tr key={t.id}>
                                <td>{new Date(t.fechaHora).toLocaleString()}</td>
                                <td>{t.barbero}</td>
                                <td>{t.servicio}</td>
                                <td>{t.estado}</td>
                                <td>${t.precioTotal ?? '-'}</td>
                                <td>
                                    <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onCancelar(t.id)}
                                    disabled={t.estado === 'cancelado'}
                                    >
                                        Cancelar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {turnos.length === 0 && (
                            <tr>
                                <td colSpan={5}>No tenés turnos próximos.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    )
}