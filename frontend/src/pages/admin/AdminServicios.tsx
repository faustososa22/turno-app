import { useEffect, useState, type FormEvent } from 'react'
import { Badge, Button, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
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
    <div className="page-wrapper">
      <div className="page-header">
        <Container fluid className="px-4 d-flex justify-content-between align-items-center">
          <div>
            <p className="page-header-label">Admin panel</p>
            <h2>Services</h2>
          </div>
          {!mostrarForm && (
            <Button variant="primary" onClick={abrirCrear}>+ New service</Button>
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

        {mostrarForm && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <h5 style={{ marginBottom: '20px' }}>{editandoId ? 'Edit service' : 'New service'}</h5>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Name</Form.Label>
                    <Form.Control value={form.nombre} required onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Type</Form.Label>
                    <Form.Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                      <option value="base">Base</option>
                      <option value="addon">Addon</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Description</Form.Label>
                    <Form.Control value={form.descripcion} required onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Duration (minutes)</Form.Label>
                    <Form.Control type="number" min={1} value={form.duracionMinutos} required onChange={e => setForm(f => ({ ...f, duracionMinutos: Number(e.target.value) }))} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px' }}>Price ($)</Form.Label>
                    <Form.Control type="number" min={0.01} step={0.01} value={form.precio} required onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-4">
                <Button type="submit" variant="primary" disabled={loadingForm}>{loadingForm ? 'Saving...' : 'Save'}</Button>
                <Button type="button" variant="outline-secondary" onClick={cancelarForm}>Cancel</Button>
              </div>
            </Form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--gold)' }} /></div>
        ) : (
          <>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600 }}>Active services</span>
                <Badge bg="success" className="ms-2">{activos.length}</Badge>
              </div>
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th className="px-4 py-3 border-0">Name</th>
                    <th className="py-3 border-0">Type</th>
                    <th className="py-3 border-0">Description</th>
                    <th className="py-3 border-0">Duration</th>
                    <th className="py-3 border-0">Price</th>
                    <th className="py-3 border-0"></th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map(s => (
                    <tr key={s.id} style={{ verticalAlign: 'middle' }}>
                      <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 600 }}>{s.nombre}</td>
                      <td className="py-3"><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'} style={{ fontSize: '12px' }}>{s.tipo}</Badge></td>
                      <td className="py-3" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{s.descripcion}</td>
                      <td className="py-3" style={{ fontSize: '14px' }}>{s.duracionMinutos} min</td>
                      <td className="py-3" style={{ fontSize: '14px', fontWeight: 600 }}>${s.precio}</td>
                      <td className="py-3">
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(s)}>Edit</Button>
                          <Button size="sm" variant="outline-danger" onClick={() => onDesactivar(s.id)}>Deactivate</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activos.length === 0 && <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No active services.</td></tr>}
                </tbody>
              </Table>
            </div>

            {desactivados.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Inactive services</span>
                  <Badge bg="secondary" className="ms-2">{desactivados.length}</Badge>
                </div>
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 border-0">Name</th>
                      <th className="py-3 border-0">Type</th>
                      <th className="py-3 border-0">Description</th>
                      <th className="py-3 border-0">Duration</th>
                      <th className="py-3 border-0">Price</th>
                      <th className="py-3 border-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {desactivados.map(s => (
                      <tr key={s.id} style={{ verticalAlign: 'middle', opacity: 0.7 }}>
                        <td className="px-4 py-3" style={{ fontSize: '14px', fontWeight: 600 }}>{s.nombre}</td>
                        <td className="py-3"><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'} style={{ fontSize: '12px' }}>{s.tipo}</Badge></td>
                        <td className="py-3" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{s.descripcion}</td>
                        <td className="py-3" style={{ fontSize: '14px' }}>{s.duracionMinutos} min</td>
                        <td className="py-3" style={{ fontSize: '14px', fontWeight: 600 }}>${s.precio}</td>
                        <td className="py-3">
                          <Button size="sm" variant="outline-success" onClick={() => onReactivar(s.id)}>Reactivate</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
