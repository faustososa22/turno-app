import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
import { barberosService } from '../../services/barberos'
import { serviciosService } from '../../services/servicios'
import type { Barbero, Servicio } from '../../types'

const FORM_VACIO = { nombre: '', apellido: '', telefono: '', email: '', password: '', fotoUrl: '' }

export function AdminBarberos() {
  const [activos, setActivos] = useState<Barbero[]>([])
  const [inactivos, setInactivos] = useState<Barbero[]>([])
  const [todosServicios, setTodosServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [loadingForm, setLoadingForm] = useState(false)

  const [gestionandoId, setGestionandoId] = useState<number | null>(null)
  const [serviciosDelBarbero, setServiciosDelBarbero] = useState<number[]>([])
  const [loadingServicios, setLoadingServicios] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const [a, i, s] = await Promise.all([
          barberosService.getActivos(),
          barberosService.getInactivos(),
          serviciosService.getAll(),
        ])
        setActivos(a)
        setInactivos(i)
        setTodosServicios(s)
      } catch {
        setError('Could not load barbers')
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [refresh])

  const abrirCrear = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setGestionandoId(null)
    setMostrarForm(true)
  }

  const abrirEditar = (b: Barbero) => {
    setEditandoId(b.id)
    setForm({ nombre: b.nombre, apellido: b.apellido, telefono: b.telefono, email: b.email, password: '', fotoUrl: b.fotoUrl ?? '' })
    setGestionandoId(null)
    setMostrarForm(true)
  }

  const cancelarForm = () => {
    setMostrarForm(false)
    setEditandoId(null)
    setForm(FORM_VACIO)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoadingForm(true)
    setError(null)
    setOk(null)
    try {
      if (editandoId !== null) {
        await barberosService.actualizar(editandoId, {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          fotoUrl: form.fotoUrl || undefined,
        })
        setOk('Barber updated successfully')
      } else {
        await barberosService.crear({ ...form, fotoUrl: form.fotoUrl || undefined })
        setOk('Barber created successfully')
      }
      cancelarForm()
      setRefresh(r => r + 1)
    } catch {
      setError('Could not save barber')
    } finally {
      setLoadingForm(false)
    }
  }

  const onDesactivar = async (id: number) => {
    setError(null)
    try { await barberosService.desactivar(id); setRefresh(r => r + 1) }
    catch { setError('Could not deactivate barber') }
  }

  const onReactivar = async (id: number) => {
    setError(null)
    try { await barberosService.reactivar(id); setRefresh(r => r + 1) }
    catch { setError('Could not reactivate barber') }
  }

  const abrirServicios = async (barberoId: number) => {
    if (gestionandoId === barberoId) { setGestionandoId(null); return }
    setLoadingServicios(true)
    setGestionandoId(barberoId)
    try {
      const data = await serviciosService.getByBarbero(barberoId)
      setServiciosDelBarbero(data.map(s => s.id))
    } catch {
      setError('Could not load barber services')
    } finally {
      setLoadingServicios(false)
    }
  }

  const toggleServicio = async (barberoId: number, servicioId: number, asignado: boolean) => {
    try {
      if (asignado) {
        await barberosService.quitarServicio(barberoId, servicioId)
        setServiciosDelBarbero(prev => prev.filter(id => id !== servicioId))
      } else {
        await barberosService.agregarServicio(barberoId, servicioId)
        setServiciosDelBarbero(prev => [...prev, servicioId])
      }
    } catch {
      setError('Could not update service')
    }
  }

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
            <h2 className="fw-bold mb-0">Barbers</h2>
          </div>
          {!mostrarForm && (
            <Button variant="light" onClick={abrirCrear}>+ New barber</Button>
          )}
        </Container>
      </div>

      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {ok && <Alert variant="success" className="mb-3">{ok}</Alert>}

        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">{editandoId ? 'Edit barber' : 'New barber'}</h5>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>First name</Form.Label>
                      <Form.Control value={form.nombre} required
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Last name</Form.Label>
                      <Form.Control value={form.apellido} required
                        onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Phone</Form.Label>
                      <Form.Control value={form.telefono} required
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Photo URL (optional)</Form.Label>
                      <Form.Control value={form.fotoUrl}
                        onChange={e => setForm(f => ({ ...f, fotoUrl: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  {editandoId === null && (
                    <>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Email</Form.Label>
                          <Form.Control type="email" value={form.email} required
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Password</Form.Label>
                          <Form.Control type="password" value={form.password} required minLength={6}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                        </Form.Group>
                      </Col>
                    </>
                  )}
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

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-0">
                <div className="px-4 py-3 border-bottom">
                  <span className="fw-semibold">Active barbers</span>
                  <Badge bg="success" className="ms-2">{activos.length}</Badge>
                </div>
                <Table hover responsive className="mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Name</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Email</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Phone</th>
                      <th className="py-3 border-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map(b => (
                      <>
                        <tr key={b.id} style={{ verticalAlign: 'middle' }}>
                          <td className="px-4 py-3 fw-semibold" style={{ fontSize: '14px' }}>{b.nombre} {b.apellido}</td>
                          <td className="py-3 text-muted" style={{ fontSize: '14px' }}>{b.email}</td>
                          <td className="py-3" style={{ fontSize: '14px' }}>{b.telefono}</td>
                          <td className="py-3">
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(b)}>Edit</Button>
                              <Button size="sm" variant={gestionandoId === b.id ? 'primary' : 'outline-primary'}
                                onClick={() => abrirServicios(b.id)}>
                                Services
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => onDesactivar(b.id)}>Deactivate</Button>
                            </div>
                          </td>
                        </tr>
                        {gestionandoId === b.id && (
                          <tr key={`servicios-${b.id}`}>
                            <td colSpan={4} style={{ background: '#f0f4ff', padding: '16px 24px' }}>
                              {loadingServicios ? <Spinner animation="border" size="sm" /> : (
                                <>
                                  <p className="fw-semibold mb-2" style={{ fontSize: '13px' }}>
                                    Services for {b.nombre}:
                                  </p>
                                  <Row className="g-2">
                                    {todosServicios.map(s => {
                                      const asignado = serviciosDelBarbero.includes(s.id)
                                      return (
                                        <Col md={4} key={s.id}>
                                          <Form.Check
                                            type="checkbox"
                                            id={`srv-${b.id}-${s.id}`}
                                            label={`${s.nombre} (${s.tipo})`}
                                            checked={asignado}
                                            onChange={() => toggleServicio(b.id, s.id, asignado)}
                                          />
                                        </Col>
                                      )
                                    })}
                                    {todosServicios.length === 0 && <Col className="text-muted" style={{ fontSize: '14px' }}>No services available.</Col>}
                                  </Row>
                                </>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                    {activos.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No active barbers.</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {inactivos.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <div className="px-4 py-3 border-bottom">
                    <span className="fw-semibold text-muted">Inactive barbers</span>
                    <Badge bg="secondary" className="ms-2">{inactivos.length}</Badge>
                  </div>
                  <Table hover responsive className="mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Name</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Email</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Phone</th>
                        <th className="py-3 border-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactivos.map(b => (
                        <tr key={b.id} style={{ verticalAlign: 'middle', opacity: 0.7 }}>
                          <td className="px-4 py-3 fw-semibold" style={{ fontSize: '14px' }}>{b.nombre} {b.apellido}</td>
                          <td className="py-3 text-muted" style={{ fontSize: '14px' }}>{b.email}</td>
                          <td className="py-3" style={{ fontSize: '14px' }}>{b.telefono}</td>
                          <td className="py-3">
                            <Button size="sm" variant="outline-success" onClick={() => onReactivar(b.id)}>Reactivate</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
