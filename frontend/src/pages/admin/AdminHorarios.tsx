import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
import { barberosService } from '../../services/barberos'
import { horariosService } from '../../services/horarios'
import type { Barbero, HorarioDisponible } from '../../types'

const DIAS = [
  { value: 'Monday',    label: 'Lunes' },
  { value: 'Tuesday',   label: 'Martes' },
  { value: 'Wednesday', label: 'Miércoles' },
  { value: 'Thursday',  label: 'Jueves' },
  { value: 'Friday',    label: 'Viernes' },
  { value: 'Saturday',  label: 'Sábado' },
  { value: 'Sunday',    label: 'Domingo' },
]

const diaLabel = (value: string) => DIAS.find(d => d.value === value)?.label ?? value

const FORM_VACIO = { diaSemana: 'Monday', horaInicio: '09:00', horaFin: '18:00' }

export function AdminHorarios() {
  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [barberoId, setBarberoId] = useState<number | ''>('')
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([])

  const [loadingBarberos, setLoadingBarberos] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState(FORM_VACIO)

  // Cargar barberos al montar
  useEffect(() => {
    const cargar = async () => {
      setLoadingBarberos(true)
      try {
        const data = await barberosService.getActivos()
        setBarberos(data)
      } catch {
        setError('No se pudieron cargar los barberos')
      } finally {
        setLoadingBarberos(false)
      }
    }
    void cargar()
  }, [])

  // Cargar horarios cuando cambia el barbero seleccionado o se recarga
  useEffect(() => {
    const cargar = async () => {
      if (!barberoId) {
        setHorarios([])
        return
      }
      setLoadingHorarios(true)
      setError(null)
      try {
        const data = await horariosService.getByBarbero(Number(barberoId))
        setHorarios(data)
      } catch {
        setError('No se pudieron cargar los horarios')
      } finally {
        setLoadingHorarios(false)
      }
    }
    void cargar()
  }, [barberoId, refresh])

  const abrirCrear = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setMostrarForm(true)
  }

  const abrirEditar = (h: HorarioDisponible) => {
    setEditandoId(h.id)
    setForm({
      diaSemana: h.diaSemana,
      horaInicio: h.horaInicio.slice(0, 5),
      horaFin: h.horaFin.slice(0, 5),
    })
    setMostrarForm(true)
  }

  const cancelarForm = () => {
    setMostrarForm(false)
    setEditandoId(null)
    setForm(FORM_VACIO)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!barberoId) return
    setLoadingForm(true)
    setError(null)
    setOk(null)

    const payload = {
      diaSemana: form.diaSemana,
      horaInicio: `${form.horaInicio}:00`,
      horaFin: `${form.horaFin}:00`,
      barberoId: Number(barberoId),
    }

    try {
      if (editandoId !== null) {
        await horariosService.actualizar(editandoId, payload)
        setOk('Horario actualizado correctamente')
      } else {
        await horariosService.crear(payload)
        setOk('Horario creado correctamente')
      }
      cancelarForm()
      setRefresh(r => r + 1)
    } catch {
      setError('No se pudo guardar el horario')
    } finally {
      setLoadingForm(false)
    }
  }

  const onEliminar = async (id: number) => {
    setError(null)
    try {
      await horariosService.eliminar(id)
      setRefresh(r => r + 1)
    } catch {
      setError('No se pudo eliminar el horario')
    }
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-3">Horarios</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Seleccioná un barbero</Form.Label>
            {loadingBarberos ? <Spinner animation="border" size="sm" /> : (
              <Form.Select
                value={barberoId}
                onChange={e => {
                  setBarberoId(e.target.value ? Number(e.target.value) : '')
                  setMostrarForm(false)
                  setOk(null)
                }}
              >
                <option value="">-- Seleccioná un barbero --</option>
                {barberos.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} {b.apellido}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {barberoId && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Horarios del barbero</h5>
            {!mostrarForm && (
              <Button variant="primary" onClick={abrirCrear}>Agregar horario</Button>
            )}
          </div>

          {mostrarForm && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{editandoId ? 'Editar horario' : 'Nuevo horario'}</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Día de la semana</Form.Label>
                        <Form.Select
                          value={form.diaSemana}
                          onChange={e => setForm(f => ({ ...f, diaSemana: e.target.value }))}
                        >
                          {DIAS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Hora inicio</Form.Label>
                        <Form.Control
                          type="time"
                          value={form.horaInicio}
                          required
                          onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Hora fin</Form.Label>
                        <Form.Control
                          type="time"
                          value={form.horaFin}
                          required
                          onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-3">
                    <Button type="submit" variant="primary" disabled={loadingForm}>
                      {loadingForm ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={cancelarForm}>
                      Cancelar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {loadingHorarios ? <Spinner animation="border" /> : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Hora inicio</th>
                  <th>Hora fin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {horarios.map(h => (
                  <tr key={h.id}>
                    <td>{diaLabel(h.diaSemana)}</td>
                    <td>{h.horaInicio.slice(0, 5)}</td>
                    <td>{h.horaFin.slice(0, 5)}</td>
                    <td className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(h)}>Editar</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => onEliminar(h.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
                {horarios.length === 0 && (
                  <tr><td colSpan={4}>Este barbero no tiene horarios cargados.</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  )
}
