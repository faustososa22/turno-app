import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
import { barberosService } from '../../services/barberos'
import { horariosService } from '../../services/horarios'
import type { Barbero, HorarioDisponible } from '../../types'

const DIAS = [
  { value: 'Monday',    label: 'Monday' },
  { value: 'Tuesday',   label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday',  label: 'Thursday' },
  { value: 'Friday',    label: 'Friday' },
  { value: 'Saturday',  label: 'Saturday' },
  { value: 'Sunday',    label: 'Sunday' },
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

  useEffect(() => {
    const cargar = async () => {
      setLoadingBarberos(true)
      try {
        const data = await barberosService.getActivos()
        setBarberos(data)
      } catch {
        setError('Could not load barbers')
      } finally {
        setLoadingBarberos(false)
      }
    }
    void cargar()
  }, [])

  useEffect(() => {
    const cargar = async () => {
      if (!barberoId) { setHorarios([]); return }
      setLoadingHorarios(true)
      setError(null)
      try {
        const data = await horariosService.getByBarbero(Number(barberoId))
        setHorarios(data)
      } catch {
        setError('Could not load schedules')
      } finally {
        setLoadingHorarios(false)
      }
    }
    void cargar()
  }, [barberoId, refresh])

  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }

  const abrirEditar = (h: HorarioDisponible) => {
    setEditandoId(h.id)
    setForm({ diaSemana: h.diaSemana, horaInicio: h.horaInicio.slice(0, 5), horaFin: h.horaFin.slice(0, 5) })
    setMostrarForm(true)
  }

  const cancelarForm = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!barberoId) return
    setLoadingForm(true)
    setError(null)
    setOk(null)
    try {
      const payload = {
        diaSemana: form.diaSemana,
        horaInicio: `${form.horaInicio}:00`,
        horaFin: `${form.horaFin}:00`,
        barberoId: Number(barberoId),
      }
      if (editandoId !== null) {
        await horariosService.actualizar(editandoId, payload)
        setOk('Schedule updated successfully')
      } else {
        await horariosService.crear(payload)
        setOk('Schedule created successfully')
      }
      cancelarForm()
      setRefresh(r => r + 1)
    } catch {
      setError('Could not save schedule')
    } finally {
      setLoadingForm(false)
    }
  }

  const onEliminar = async (id: number) => {
    setError(null)
    try { await horariosService.eliminar(id); setRefresh(r => r + 1) }
    catch { setError('Could not delete schedule') }
  }

  const barberoSeleccionado = barberos.find(b => b.id === barberoId)

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        color: 'white',
        padding: '40px 0 64px',
      }}>
        <Container fluid className="px-4 d-flex justify-content-between align-items-center">
          <div>
            <p className="text-white-50 mb-1" style={{ fontSize: '14px' }}>Admin panel</p>
            <h2 className="fw-bold mb-0">Schedules</h2>
          </div>
          {barberoId && !mostrarForm && (
            <Button variant="light" onClick={abrirCrear}>+ Add schedule</Button>
          )}
        </Container>
      </div>

      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {ok && <Alert variant="success" className="mb-3">{ok}</Alert>}

        {/* Barber selector */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Form.Group>
              <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Select a barber</Form.Label>
              {loadingBarberos ? <Spinner animation="border" size="sm" /> : (
                <Form.Select
                  value={barberoId}
                  style={{ maxWidth: '320px' }}
                  onChange={e => {
                    setBarberoId(e.target.value ? Number(e.target.value) : '')
                    setMostrarForm(false)
                    setOk(null)
                  }}
                >
                  <option value="">-- Select a barber --</option>
                  {barberos.map(b => (
                    <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Card.Body>
        </Card>

        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">{editandoId ? 'Edit schedule' : 'New schedule'}</h5>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Day of the week</Form.Label>
                      <Form.Select value={form.diaSemana} onChange={e => setForm(f => ({ ...f, diaSemana: e.target.value }))}>
                        {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Start time</Form.Label>
                      <Form.Control type="time" value={form.horaInicio} required
                        onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>End time</Form.Label>
                      <Form.Control type="time" value={form.horaFin} required
                        onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))} />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="primary" disabled={loadingForm}>
                    {loadingForm ? 'Saving...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={cancelarForm}>Cancel</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        {barberoId && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="px-4 py-3 border-bottom">
                <span className="fw-semibold">
                  {barberoSeleccionado ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}` : 'Barber'}'s schedules
                </span>
              </div>
              {loadingHorarios ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Day</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Start time</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>End time</th>
                      <th className="py-3 border-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map(h => (
                      <tr key={h.id} style={{ verticalAlign: 'middle' }}>
                        <td className="px-4 py-3 fw-semibold" style={{ fontSize: '14px' }}>{diaLabel(h.diaSemana)}</td>
                        <td className="py-3" style={{ fontSize: '14px' }}>{h.horaInicio.slice(0, 5)}</td>
                        <td className="py-3" style={{ fontSize: '14px' }}>{h.horaFin.slice(0, 5)}</td>
                        <td className="py-3">
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(h)}>Edit</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => onEliminar(h.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {horarios.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">This barber has no schedules.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  )
}
