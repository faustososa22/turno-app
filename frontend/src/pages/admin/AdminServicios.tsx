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
        setError('No se pudieron cargar los servicios')
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [refresh])

  const abrirCrear = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setMostrarForm(true)
  }

  const abrirEditar = (s: Servicio) => {
    setEditandoId(s.id)
    setForm({ nombre: s.nombre, descripcion: s.descripcion, duracionMinutos: s.duracionMinutos, precio: s.precio, tipo: s.tipo })
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
        await serviciosService.actualizar(editandoId, form)
        setOk('Servicio actualizado correctamente')
      } else {
        await serviciosService.crear(form)
        setOk('Servicio creado correctamente')
      }
      cancelarForm()
      setRefresh(r => r + 1)
    } catch {
      setError('No se pudo guardar el servicio')
    } finally {
      setLoadingForm(false)
    }
  }

  const onDesactivar = async (id: number) => {
    setError(null)
    try {
      await serviciosService.desactivar(id)
      setRefresh(r => r + 1)
    } catch {
      setError('No se pudo desactivar el servicio')
    }
  }

  const onReactivar = async (id: number) => {
    setError(null)
    try {
      await serviciosService.reactivar(id)
      setRefresh(r => r + 1)
    } catch {
      setError('No se pudo reactivar el servicio')
    }
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Servicios</h2>
        {!mostrarForm && (
          <Button variant="primary" onClick={abrirCrear}>Nuevo servicio</Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      {mostrarForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>{editandoId ? 'Editar servicio' : 'Nuevo servicio'}</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      value={form.nombre}
                      required
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      value={form.tipo}
                      onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    >
                      <option value="base">Base</option>
                      <option value="addon">Addon</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      value={form.descripcion}
                      required
                      onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Duración (minutos)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      value={form.duracionMinutos}
                      required
                      onChange={e => setForm(f => ({ ...f, duracionMinutos: Number(e.target.value) }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Precio ($)</Form.Label>
                    <Form.Control
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={form.precio}
                      required
                      onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))}
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

      {loading ? <Spinner animation="border" /> : (
        <>
          <h5>Activos</h5>
          <Table striped bordered hover responsive className="mb-4">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Duración</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activos.map(s => (
                <tr key={s.id}>
                  <td>{s.nombre}</td>
                  <td><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'}>{s.tipo}</Badge></td>
                  <td>{s.descripcion}</td>
                  <td>{s.duracionMinutos} min</td>
                  <td>${s.precio}</td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => abrirEditar(s)}>Editar</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => onDesactivar(s.id)}>Desactivar</Button>
                  </td>
                </tr>
              ))}
              {activos.length === 0 && (
                <tr><td colSpan={6}>No hay servicios activos.</td></tr>
              )}
            </tbody>
          </Table>

          {desactivados.length > 0 && (
            <>
              <h5>Desactivados</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Duración</th>
                    <th>Precio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {desactivados.map(s => (
                    <tr key={s.id}>
                      <td>{s.nombre}</td>
                      <td><Badge bg={s.tipo === 'base' ? 'primary' : 'secondary'}>{s.tipo}</Badge></td>
                      <td>{s.descripcion}</td>
                      <td>{s.duracionMinutos} min</td>
                      <td>${s.precio}</td>
                      <td>
                        <Button size="sm" variant="outline-success" onClick={() => onReactivar(s.id)}>Reactivar</Button>
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
