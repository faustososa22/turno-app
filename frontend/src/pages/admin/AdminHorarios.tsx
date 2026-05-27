import { useEffect, useState, type FormEvent } from 'react'
import { Button, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
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
    <div className="page-wrapper">
      <div className="page-header">
        <Container fluid className="px-4 d-flex justify-content-between align-items-center">
          <div>
            <p className="page-header-label">Admin panel</p>
            <h2>Schedules</h2>
          </div>
          {barberoId && !mostrarForm && (
            <Button variant="primary" onClick={abrirCrear}>+ Add schedule</Button>
          )}
        </Container>
      </div>

      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        {error && (
          <div style={{ background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.25)', color: '#f08080', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {ok && (
          <div style={{ background: 'rgba(40,167,69,0.1)', border: '1px solid rgba(40,167,69,0.25)', color: '#75c987', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', marginBottom: '16px' }}>
            {ok}
          </div>
        )}

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <Form.Group>
            <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Select a barber</Form.Label>
            {loadingBarberos ? <Spinner animation="border" size="sm" style={{ color: 'var(--gold)' }} /> : (
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
        </div>

        {mostrarForm && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <h5 style={{ marginBottom: '20px' }}>{editandoId ? 'Edit schedule' : 'New schedule'}</h5>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Day of the week</Form.Label>
                    <Form.Select value={form.diaSemana} onChange={e => setForm(f => ({ ...f, diaSemana: e.target.value }))}>
                      {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Start time</Form.Label>
                    <Form.Control type="time" value={form.horaInicio} required
                      onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>End time</Form.Label>
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
          </div>
        )}

        {barberoId && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>
                {barberoSeleccionado ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}` : 'Barber'}'s schedules
              </span>
            </div>
            {loadingHorarios ? (
              <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--gold)' }} /></div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th className="px-4 py-3 border-0">Day</th>
                    <th className="py-3 border-0">Start time</th>
                    <th className="py-3 border-0">End time</th>
                    <th className="py-3 border-0"></th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map(h => (
                    <tr key={h.id} style={{ verticalAlign: 'middle' }}>
                      <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 600 }}>{diaLabel(h.diaSemana)}</td>
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
                    <tr><td colSpan={4} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>This barber has no schedules.</td></tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
