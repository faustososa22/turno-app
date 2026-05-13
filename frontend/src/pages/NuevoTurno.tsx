import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
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
  const [submitOk, setSubmitOk] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingInicial(true)
      try {
        const data = await barberosService.getActivos()
        setBarberos(data)
      } catch {
        setError('Could not load barbers')
      } finally {
        setLoadingInicial(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    const loadServicios = async () => {
      setHuecos([]); setHuecosConsultados(false); setHora('')
      if (!barberoId) { setServicios([]); setServicioBaseId(''); setAddonIds([]); return }
      setError(null)
      try {
        const data = await serviciosService.getByBarbero(Number(barberoId))
        setServicios(data)
        setServicioBaseId('')
        setAddonIds([])
      } catch {
        setError('Could not load barber services')
      }
    }
    void loadServicios()
  }, [barberoId])

  const serviciosBase = useMemo(() => servicios.filter(s => s.tipo === 'base'), [servicios])
  const addons = useMemo(() => servicios.filter(s => s.tipo === 'addon'), [servicios])

  const duracionTotal = useMemo(() => {
    const base = servicios.find(s => s.id === Number(servicioBaseId))
    const adds = servicios.filter(s => addonIds.includes(s.id))
    return (base?.duracionMinutos ?? 0) + adds.reduce((acc, s) => acc + s.duracionMinutos, 0)
  }, [servicios, servicioBaseId, addonIds])

  const precioTotal = useMemo(() => {
    const base = servicios.find(s => s.id === Number(servicioBaseId))
    const adds = servicios.filter(s => addonIds.includes(s.id))
    return (base?.precio ?? 0) + adds.reduce((acc, s) => acc + s.precio, 0)
  }, [servicios, servicioBaseId, addonIds])

  const cargarHuecos = async () => {
    if (!barberoId || !fecha || !duracionTotal) return
    const [anio, mes, dia] = fecha.split('-').map(Number)
    setLoadingHuecos(true)
    setError(null)
    setHora('')
    try {
      const data = await horariosService.getHuecos({ barberoId: Number(barberoId), anio, mes, dia, duracionMinutos: duracionTotal })
      setHuecos(data)
    } catch {
      setError('Could not load available time slots')
    } finally {
      setLoadingHuecos(false)
      setHuecosConsultados(true)
    }
  }

  const toggleAddon = (id: number) => {
    setAddonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setHuecos([]); setHuecosConsultados(false); setHora('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!barberoId || !servicioBaseId || !fecha || !hora) {
      setError('Please fill in all required fields')
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
      setSubmitOk(true)
      setTimeout(() => navigate('/mis-turnos'), 1200)
    } catch {
      setError('Could not create the appointment')
    } finally {
      setLoadingSubmit(false)
    }
  }

  const barberoSeleccionado = barberos.find(b => b.id === barberoId)
  const servicioBase = servicios.find(s => s.id === Number(servicioBaseId))
  const huecosFiltrados = huecos.filter(h => h.disponible)

  if (loadingInicial) {
    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', color: 'white', padding: '40px 0 64px' }}>
          <Container fluid className="px-4">
            <p className="text-white-50 mb-1" style={{ fontSize: '14px' }}>Booking</p>
            <h2 className="fw-bold mb-0">New appointment</h2>
          </Container>
        </div>
        <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
          <Card className="border-0 shadow-sm p-5 text-center">
            <Spinner animation="border" />
          </Card>
        </Container>
      </div>
    )
  }

  if (submitOk) {
    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', color: 'white', padding: '40px 0 64px' }}>
          <Container fluid className="px-4">
            <p className="text-white-50 mb-1" style={{ fontSize: '14px' }}>Booking</p>
            <h2 className="fw-bold mb-0">New appointment</h2>
          </Container>
        </div>
        <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
          <Card className="border-0 shadow-sm text-center p-5">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h4 className="fw-bold mt-3 mb-1">Appointment booked!</h4>
            <p className="text-muted">Redirecting to your appointments...</p>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        color: 'white',
        padding: '40px 0 64px',
      }}>
        <Container fluid className="px-4">
          <p className="text-white-50 mb-1" style={{ fontSize: '14px' }}>Booking</p>
          <h2 className="fw-bold mb-0">New appointment</h2>
        </Container>
      </div>

      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        <Row className="g-4">
          {/* Form */}
          <Col lg={8}>
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">{error}</div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Step 1: Barber */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Step 1</p>
                  <h5 className="fw-bold mb-3">Choose a barber</h5>
                  <Form.Select
                    value={barberoId}
                    onChange={e => setBarberoId(e.target.value ? Number(e.target.value) : '')}
                    required
                    style={{ maxWidth: '360px' }}
                  >
                    <option value="">Select a barber...</option>
                    {barberos.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>
                    ))}
                  </Form.Select>
                </Card.Body>
              </Card>

              {/* Step 2: Service */}
              <Card className="border-0 shadow-sm mb-4" style={{ opacity: barberoId ? 1 : 0.5 }}>
                <Card.Body className="p-4">
                  <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Step 2</p>
                  <h5 className="fw-bold mb-3">Choose a service</h5>

                  {barberoId && serviciosBase.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '14px' }}>No services available for this barber.</p>
                  ) : (
                    <Row className="g-3">
                      {serviciosBase.map(s => (
                        <Col md={6} key={s.id}>
                          <div
                            onClick={() => {
                              if (!barberoId) return
                              setServicioBaseId(s.id)
                              setHuecos([]); setHuecosConsultados(false); setHora('')
                            }}
                            style={{
                              border: `2px solid ${servicioBaseId === s.id ? '#0f3460' : '#dee2e6'}`,
                              borderRadius: '8px',
                              padding: '14px 16px',
                              cursor: barberoId ? 'pointer' : 'default',
                              background: servicioBaseId === s.id ? '#f0f4ff' : 'white',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div className="fw-semibold" style={{ fontSize: '14px' }}>{s.nombre}</div>
                            <div className="text-muted" style={{ fontSize: '13px' }}>{s.duracionMinutos} min · ${s.precio}</div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}

                  {addons.length > 0 && (
                    <div className="mt-4">
                      <p className="fw-semibold mb-2" style={{ fontSize: '13px' }}>Add-ons (optional)</p>
                      <Row className="g-2">
                        {addons.map(s => {
                          const checked = addonIds.includes(s.id)
                          return (
                            <Col md={6} key={s.id}>
                              <div
                                onClick={() => { if (servicioBaseId) toggleAddon(s.id) }}
                                style={{
                                  border: `2px solid ${checked ? '#198754' : '#dee2e6'}`,
                                  borderRadius: '8px',
                                  padding: '10px 14px',
                                  cursor: servicioBaseId ? 'pointer' : 'default',
                                  background: checked ? '#f0fff4' : 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.15s',
                                  opacity: servicioBaseId ? 1 : 0.5,
                                }}
                              >
                                <div style={{
                                  width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
                                  border: `2px solid ${checked ? '#198754' : '#adb5bd'}`,
                                  background: checked ? '#198754' : 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {checked && <span style={{ color: 'white', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                                </div>
                                <div>
                                  <div className="fw-semibold" style={{ fontSize: '13px' }}>{s.nombre}</div>
                                  <div className="text-muted" style={{ fontSize: '12px' }}>+{s.duracionMinutos} min · +${s.precio}</div>
                                </div>
                              </div>
                            </Col>
                          )
                        })}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Step 3: Date & time */}
              <Card className="border-0 shadow-sm mb-4" style={{ opacity: servicioBaseId ? 1 : 0.5 }}>
                <Card.Body className="p-4">
                  <p className="text-muted mb-1" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Step 3</p>
                  <h5 className="fw-bold mb-3">Pick a date & time</h5>

                  <div className="d-flex align-items-end gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: '13px' }}>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={fecha}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => {
                          setFecha(e.target.value)
                          setHuecos([]); setHuecosConsultados(false); setHora('')
                        }}
                        required
                        disabled={!servicioBaseId}
                        style={{ maxWidth: '200px' }}
                      />
                    </Form.Group>
                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={cargarHuecos}
                      disabled={!barberoId || !fecha || !duracionTotal || loadingHuecos}
                    >
                      {loadingHuecos ? <><Spinner animation="border" size="sm" className="me-2" />Loading...</> : 'Search slots'}
                    </Button>
                  </div>

                  {loadingHuecos && (
                    <div className="text-center py-3"><Spinner animation="border" /></div>
                  )}

                  {!loadingHuecos && huecosConsultados && huecosFiltrados.length === 0 && (
                    <p className="text-muted" style={{ fontSize: '14px' }}>No available time slots for that day.</p>
                  )}

                  {!loadingHuecos && huecosFiltrados.length > 0 && (
                    <>
                      <p className="fw-semibold mb-2" style={{ fontSize: '13px' }}>Available slots</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {huecosFiltrados.map(h => (
                          <button
                            key={h.hora}
                            type="button"
                            onClick={() => setHora(h.hora)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: `2px solid ${hora === h.hora ? '#0f3460' : '#dee2e6'}`,
                              background: hora === h.hora ? '#0f3460' : 'white',
                              color: hora === h.hora ? 'white' : '#212529',
                              fontWeight: hora === h.hora ? 600 : 400,
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {h.hora}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={loadingSubmit || !barberoId || !servicioBaseId || !fecha || !hora}
                style={{ width: '100%', padding: '14px' }}
              >
                {loadingSubmit ? <><Spinner animation="border" size="sm" className="me-2" />Confirming...</> : 'Confirm appointment'}
              </Button>
            </Form>
          </Col>

          {/* Summary */}
          <Col lg={4}>
            <div style={{ position: 'sticky', top: '24px' }}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h6 className="text-muted text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '12px' }}>
                    Summary
                  </h6>

                  <div className="d-flex flex-column gap-3">
                    <div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>Barber</div>
                      <div className="fw-semibold" style={{ fontSize: '14px' }}>
                        {barberoSeleccionado ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>Service</div>
                      <div className="fw-semibold" style={{ fontSize: '14px' }}>
                        {servicioBase ? servicioBase.nombre : '—'}
                      </div>
                      {addonIds.length > 0 && (
                        <div className="text-muted" style={{ fontSize: '13px' }}>
                          + {servicios.filter(s => addonIds.includes(s.id)).map(s => s.nombre).join(', ')}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>Date & time</div>
                      <div className="fw-semibold" style={{ fontSize: '14px' }}>
                        {fecha && hora ? `${fecha} at ${hora}` : '—'}
                      </div>
                    </div>

                    <hr className="my-1" />

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted" style={{ fontSize: '13px' }}>Duration</span>
                      <Badge bg="secondary" style={{ fontSize: '13px' }}>{duracionTotal ? `${duracionTotal} min` : '—'}</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">Total price</span>
                      <span className="fw-bold fs-5" style={{ color: '#0f3460' }}>${precioTotal}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
