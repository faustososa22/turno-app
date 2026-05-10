import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import type { Barbero, HuecoDisponible, Servicio } from '../types'
import { barberosService } from '../services/barberos'
import { serviciosService } from '../services/servicios'
import { horariosService } from '../services/horarios'
import { turnoService } from '../services/turnos'

export function NuevoTurno() {
  const navigate = useNavigate()

  const [barberos, setBarberos] = useState<Barbero[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [huecos, setHuecos] = useState<HuecoDisponible[]>([])
  const [huecosConsultados, setHuecosConsultados] = useState(false)

  const [barberoId, setBarberoId] = useState<number | ''>('')
  const [servicioBaseId, setServicioBaseId] = useState<number | ''>('')
  const [addonIds, setAddonIds] = useState<number[]>([])
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  const [loadingInicial, setLoadingInicial] = useState(true)
  const [loadingHuecos, setLoadingHuecos] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingInicial(true)
      setError(null)
      try {
        const data = await barberosService.getActivos()
        setBarberos(data)
      } catch {
        setError('No se pudieron cargar los barberos')
      } finally {
        setLoadingInicial(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    const loadServicios = async () => {
        setHuecos([])
        setHuecosConsultados(false)
        setHora('')
      if (!barberoId) {
        setServicios([])
        setServicioBaseId('')
        setAddonIds([])
        return
      }

      setError(null)
      try {
        const data = await serviciosService.getByBarbero(Number(barberoId))
        setServicios(data)
        setServicioBaseId('')
        setAddonIds([])
      } catch {
        setError('No se pudieron cargar los servicios del barbero')
      }
    }

    void loadServicios()
  }, [barberoId])



  const serviciosBase = useMemo(() => servicios.filter((s) => s.tipo === 'base'), [servicios])
  const addons = useMemo(() => servicios.filter((s) => s.tipo === 'addon'), [servicios])

  const duracionTotal = useMemo(() => {
    const base = servicios.find((s) => s.id === Number(servicioBaseId))
    const adds = servicios.filter((s) => addonIds.includes(s.id))
    return (base?.duracionMinutos ?? 0) + adds.reduce((acc, s) => acc + s.duracionMinutos, 0)
  }, [servicios, servicioBaseId, addonIds])

  const precioTotal = useMemo(() => {
    const base = servicios.find((s) => s.id === Number(servicioBaseId))
    const adds = servicios.filter((s) => addonIds.includes(s.id))
    return (base?.precio ?? 0) + adds.reduce((acc, s) => acc + s.precio, 0)
  }, [servicios, servicioBaseId, addonIds])


  const cargarHuecos = async () => {
    if (!barberoId || !fecha || !duracionTotal) return

    const [anio, mes, dia] = fecha.split('-').map(Number)

    setLoadingHuecos(true)
    setError(null)
    setHora('')
    try {
      const data = await horariosService.getHuecos({
        barberoId: Number(barberoId),
        anio,
        mes,
        dia,
        duracionMinutos: duracionTotal,
      })
      setHuecos(data)
    } catch {
      setError('No se pudieron cargar los horarios disponibles')
    } finally {
      setLoadingHuecos(false)
      setHuecosConsultados(true)
    }
  }

  const toggleAddon = (id: number) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setHuecos([])
    setHuecosConsultados(false)
    setHora('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setOk(null)

    if (!barberoId || !servicioBaseId || !fecha || !hora) {
      setError('Completá todos los campos obligatorios')
      return
    }

    setLoadingSubmit(true)
    try {
      await turnoService.crearTurno({
        barberoId: Number(barberoId),
        servicioBaseId: Number(servicioBaseId),
        addonIds,
        fechaHora: `${fecha}T${hora}:00`,
      })

      setOk('Turno creado correctamente')
      setTimeout(() => navigate('/mis-turnos'), 800)
    } catch {
      setError('No se pudo crear el turno')
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loadingInicial) {
    return (
      <Container fluid className="py-4">
        <Spinner animation="border" />
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-3">Nuevo turno</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Barbero</Form.Label>
                  <Form.Select
                    value={barberoId}
                    onChange={(e) => setBarberoId(e.target.value ? Number(e.target.value) : '')}
                    required
                  >
                    <option value="">Seleccioná un barbero</option>
                    {barberos.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre} {b.apellido}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Servicio base</Form.Label>
                  <Form.Select
                    value={servicioBaseId}
                    onChange={(e) => {setServicioBaseId(e.target.value ? Number(e.target.value) : '')
                        setHuecos([])
                        setHuecosConsultados(false)
                        setHora('')
                    }}
                    required
                    disabled={!barberoId}
                  >
                    <option value="">Seleccioná un servicio base</option>
                    {serviciosBase.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.duracionMinutos} min - ${s.precio})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Addons (opcionales)</Form.Label>
                  {addons.length === 0 && <div className="text-muted">No hay addons para este barbero.</div>}
                  {addons.map((s) => (
                    <Form.Check
                      key={s.id}
                      type="checkbox"
                      id={`addon-${s.id}`}
                      label={`${s.nombre} (+${s.duracionMinutos} min - $${s.precio})`}
                      checked={addonIds.includes(s.id)}
                      onChange={() => toggleAddon(s.id)}
                      disabled={!servicioBaseId}
                    />
                  ))}
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        value={fecha}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {setFecha(e.target.value)
                            setHuecos([])
                            setHuecosConsultados(false)
                            setHora('')
                        }}
                        required
                        disabled={!servicioBaseId}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="d-flex align-items-end">
                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={cargarHuecos}
                      disabled={!barberoId || !fecha || !duracionTotal || loadingHuecos}
                    >
                      {loadingHuecos ? 'Cargando...' : 'Buscar horarios'}
                    </Button>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Horario</Form.Label>
                  <Form.Select
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    disabled={huecos.length === 0}
                  >
                    <option value="">Seleccioná un horario</option>
                    {huecos
                      .filter((h) => h.disponible)
                      .map((h) => (
                        <option key={h.hora} value={h.hora}>
                          {h.hora}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
                {huecosConsultados && huecos.filter(h => h.disponible).length === 0 && (
                    <p className="text-danger mt-1">No hay horarios disponibles para ese día.</p>
                )}

                <Button type="submit" variant="primary" disabled={loadingSubmit}>
                  {loadingSubmit ? 'Confirmando...' : 'Confirmar turno'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>Resumen</Card.Title>
              <p className="mb-2">
                Duración total: <Badge bg="secondary">{duracionTotal} min</Badge>
              </p>
              <p className="mb-0">
                Precio total: <Badge bg="success">${precioTotal}</Badge>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}