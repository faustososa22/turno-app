import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
import { serviciosService } from '../../services/servicios'
import type { Servicio } from '../../types'

const FORM_VACIO = { nombre: '', descripcion: '', duracionMinutos: 0, precio: 0, tipo: 'base' }

export function AdminServicios() {
  const [activos, setActivos] = useState<Servicio[]>([])
  const [desactivados, setDesactivados] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [refresh, setRefresh] = useState(0)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [loadingForm, setLoadingForm] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const [a, d] = await Promise.all([
          serviciosService.getAll(),
          serviciosService.getDesactivados(),
        ])
        setActivos(a)
        setDesactivados(d)
      } catch {
        setError('Could not load services')
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [refresh])

  const abrirCrear = () => { setEditandoId(null); setForm(FORM_VACIO); setMostrarForm(true) }
  const abrirEditar = (s: Servicio) => {
    setEditandoId(s.id)
    setForm({ nombre: s.nombre, descripcion: s.descripcion, duracionMinutos: s.duracionMinutos, precio: s.precio, tipo: s.tipo })
    setMostrarForm(true)
  }
  const cancelarForm = () => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoadingForm(true); setError(null); setOk(null)
    try {
      if (editandoId !== null) {
        await serviciosService.actualizar(editandoId, form)
        setOk('Service updated successfully')
      } else {
        await serviciosService.crear(form)
        setOk('Service created successfully')
      }
      cancelarForm()
      setRefresh(r => r + 1)
    } catch {
      setError('Could not save service')
    } finally {
      setLoadingForm(false)
    }
  }

  const onDesactivar = async (id: number) => {
    setError(null)
    try { await serviciosService.desactivar(id); setRefresh(r => r + 1) }
    catch { setError('Could not deactivate service') }
  }

  const onReactivar = async (id: number) => {
    setError(null)
    try { await serviciosService.reactivar(id); setRefresh(r => r + 1) }
    catch { setError('Could not reactivate service') }
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
            <h2 className="fw-bold mb-0">Services</h2>
          </div>
          {!mostrarForm && (
            <Button variant="light" onClick={abrirCrear}>+ New service</Button>
          )}
        </Container>
      </div>

      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {ok && <Alert variant="success" className="mb-3">{ok}</Alert>}

        {mostrarForm && (
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">{editandoId ? 'Edit service' : 'New service'}</h5>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Name</Form.Label>
                      <Form.Control value={form.nombre} required onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Type</Form.Label>
                      <Form.Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                        <option value="base">Base</option>
                        <option value="addon">Addon</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Description</Form.Label>
                      <Form.Control value={form.descripcion} required onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Duration (minutes)</Form.Label>
                      <Form.Control type="number" min={1} value={form.duracionMinutos} required onChange={e => setForm(f => ({ ...f, duracionMinutos: Number(e.target.value) }))} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Price ($)</Form.Label>
                      <Form.Control type="number" min={0.01} step={0.01} value={form.precio} required onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-4">
                  <Button type="submit" variant="primary" disabled={loadingForm}>{loadingForm ? 'Saving...' : 'Save'}</Button>
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
                  <span className="fw-semibold">Active services</span>
                  <Badge bg="success" className="ms-2">{activos.length}</Badge>
                </div>
                <Table hover responsive className="mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Name</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Type</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Description</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Duration</th>
                      <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Price</th>
                      <th className="py-3 border-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map(s => (
                      <tr key={s.id} style={{ verticalAlign: 'middle' }}>
                        <td className="px-4 py-3 fw-semibold" style={{ fontSize: '14px' }}>{s.nombre}</td>
                        <td className="py-3"><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'} style={{ fontSize: '12px' }}>{s.tipo}</Badge></td>
                        <td className="py-3 text-muted" style={{ fontSize: '14px' }}>{s.descripcion}</td>
                        <td className="py-3" style={{ fontSize: '14px' }}>{s.duracionMinutos} min</td>
                        <td className="py-3 fw-semibold" style={{ fontSize: '14px' }}>${s.precio}</td>
                        <td className="py-3">
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(s)}>Edit</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => onDesactivar(s.id)}>Deactivate</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activos.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted">No active services.</td></tr>}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {desactivados.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <div className="px-4 py-3 border-bottom">
                    <span className="fw-semibold text-muted">Inactive services</span>
                    <Badge bg="secondary" className="ms-2">{desactivados.length}</Badge>
                  </div>
                  <Table hover responsive className="mb-0">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Name</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Type</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Description</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Duration</th>
                        <th className="py-3 fw-semibold text-muted border-0" style={{ fontSize: '13px' }}>Price</th>
                        <th className="py-3 border-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {desactivados.map(s => (
                        <tr key={s.id} style={{ verticalAlign: 'middle', opacity: 0.7 }}>
                          <td className="px-4 py-3 fw-semibold" style={{ fontSize: '14px' }}>{s.nombre}</td>
                          <td className="py-3"><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'} style={{ fontSize: '12px' }}>{s.tipo}</Badge></td>
                          <td className="py-3 text-muted" style={{ fontSize: '14px' }}>{s.descripcion}</td>
                          <td className="py-3" style={{ fontSize: '14px' }}>{s.duracionMinutos} min</td>
                          <td className="py-3 fw-semibold" style={{ fontSize: '14px' }}>${s.precio}</td>
                          <td className="py-3">
                            <Button size="sm" variant="outline-success" onClick={() => onReactivar(s.id)}>Reactivate</Button>
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
