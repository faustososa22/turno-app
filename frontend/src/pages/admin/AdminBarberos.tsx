import { useEffect, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap'
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
        await barberosService.crear({
          ...form,
          fotoUrl: form.fotoUrl || undefined,
        })
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
    try {
      await barberosService.desactivar(id)
      setRefresh(r => r + 1)
    } catch {
      setError('Could not deactivate barber')
    }
  }

  const onReactivar = async (id: number) => {
    setError(null)
    try {
      await barberosService.reactivar(id)
      setRefresh(r => r + 1)
    } catch {
      setError('Could not reactivate barber')
    }
  }

  const abrirServicios = async (barberoId: number) => {
    if (gestionandoId === barberoId) {
      setGestionandoId(null)
      return
    }
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
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Barbers</h2>
        {!mostrarForm && (
          <Button variant="primary" onClick={abrirCrear}>New barber</Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      {mostrarForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>{editandoId ? 'Edit barber' : 'New barber'}</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>First name</Form.Label>
                    <Form.Control value={form.nombre} required
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Last name</Form.Label>
                    <Form.Control value={form.apellido} required
                      onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control value={form.telefono} required
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Photo URL (optional)</Form.Label>
                    <Form.Control value={form.fotoUrl}
                      onChange={e => setForm(f => ({ ...f, fotoUrl: e.target.value }))} />
                  </Form.Group>
                </Col>
                {editandoId === null && (
                  <>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={form.email} required
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" value={form.password} required minLength={6}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
              <div className="d-flex gap-2 mt-3">
                <Button type="submit" variant="primary" disabled={loadingForm}>
                  {loadingForm ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={cancelarForm}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? <Spinner animation="border" /> : (
        <>
          <h5>Active</h5>
          <Table striped bordered hover responsive className="mb-2">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activos.map(b => (
                <>
                  <tr key={b.id}>
                    <td>{b.nombre} {b.apellido}</td>
                    <td>{b.email}</td>
                    <td>{b.telefono}</td>
                    <td className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(b)}>Edit</Button>
                      <Button size="sm" variant={gestionandoId === b.id ? 'secondary' : 'outline-primary'}
                        onClick={() => abrirServicios(b.id)}>
                        Services
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => onDesactivar(b.id)}>Deactivate</Button>
                    </td>
                  </tr>
                  {gestionandoId === b.id && (
                    <tr key={`servicios-${b.id}`}>
                      <td colSpan={4}>
                        {loadingServicios ? <Spinner animation="border" size="sm" /> : (
                          <div className="p-2">
                            <strong className="d-block mb-2">Services for {b.nombre}:</strong>
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
                              {todosServicios.length === 0 && <Col>No services available.</Col>}
                            </Row>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {activos.length === 0 && <tr><td colSpan={4}>No active barbers.</td></tr>}
            </tbody>
          </Table>

          {inactivos.length > 0 && (
            <>
              <h5 className="mt-4">Inactive</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inactivos.map(b => (
                    <tr key={b.id}>
                      <td>{b.nombre} {b.apellido}</td>
                      <td>{b.email}</td>
                      <td>{b.telefono}</td>
                      <td>
                        <Button size="sm" variant="outline-success" onClick={() => onReactivar(b.id)}>Reactivate</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Container>
  )
}
