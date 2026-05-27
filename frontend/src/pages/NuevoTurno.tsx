import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
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
        setServicios(data); setServicioBaseId(''); setAddonIds([])
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
    setLoadingHuecos(true); setError(null); setHora('')
    try {
      const data = await horariosService.getHuecos({ barberoId: Number(barberoId), anio, mes, dia, duracionMinutos: duracionTotal })
      setHuecos(data)
    } catch {
      setError('Could not load available time slots')
    } finally {
      setLoadingHuecos(false); setHuecosConsultados(true)
    }
  }

  const toggleAddon = (id: number) => {
    setAddonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setHuecos([]); setHuecosConsultados(false); setHora('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!barberoId || !servicioBaseId || !fecha || !hora) { setError('Please fill in all required fields'); return }
    setLoadingSubmit(true)
    try {
      await turnoService.crearTurno({ barberoId: Number(barberoId), servicioBaseId: Number(servicioBaseId), addonIds, fechaHora: `${fecha}T${hora}:00` })
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

  const pageHeader = (
    <div className="page-header">
      <Container fluid className="px-4">
        <p className="page-header-label">Booking</p>
        <h2>New appointment</h2>
      </Container>
    </div>
  )

  if (loadingInicial) return (
    <div className="page-wrapper">
      {pageHeader}
      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <Spinner animation="border" style={{ color: 'var(--gold)' }} />
        </div>
      </Container>
    </div>
  )

  if (submitOk) return (
    <div className="page-wrapper">
      {pageHeader}
      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h4 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '8px' }}>Appointment booked!</h4>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your appointments...</p>
        </div>
      </Container>
    </div>
  )

  return (
    <div className="page-wrapper">
      {pageHeader}
      <Container fluid className="px-4" style={{ marginTop: '-32px' }}>
        <Row className="g-4">
          <Col lg={8}>
            {error && (
              <div style={{ background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.25)', color: '#f08080', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Step 1: Barber */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <p className="step-label">Step 1</p>
                <h5 style={{ marginBottom: '16px' }}>Choose a barber</h5>
                <Form.Select value={barberoId} onChange={e => setBarberoId(e.target.value ? Number(e.target.value) : '')} required style={{ maxWidth: '360px' }}>
                  <option value="">Select a barber...</option>
                  {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre} {b.apellido}</option>)}
                </Form.Select>
              </div>

              {/* Step 2: Service */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px', opacity: barberoId ? 1 : 0.5 }}>
                <p className="step-label">Step 2</p>
                <h5 style={{ marginBottom: '16px' }}>Choose a service</h5>
                {barberoId && serviciosBase.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No services available for this barber.</p>
                ) : (
                  <Row className="g-3">
                    {serviciosBase.map(s => (
                      <Col md={6} key={s.id}>
                        <div
                          className={`selectable-card ${servicioBaseId === s.id ? 'selected' : ''}`}
                          onClick={() => { if (!barberoId) return; setServicioBaseId(s.id); setHuecos([]); setHuecosConsultados(false); setHora('') }}
                        >
                          <div className="card-title">{s.nombre}</div>
                          <div className="card-subtitle">{s.duracionMinutos} min · ${s.precio}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}

                {addons.length > 0 && (
                  <div className="mt-4">
                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px', color: 'var(--text-muted)' }}>Add-ons (optional)</p>
                    <Row className="g-2">
                      {addons.map(s => {
                        const checked = addonIds.includes(s.id)
                        return (
                          <Col md={6} key={s.id}>
                            <div className={`addon-card ${checked ? 'selected' : ''}`} onClick={() => { if (servicioBaseId) toggleAddon(s.id) }} style={{ opacity: servicioBaseId ? 1 : 0.5 }}>
                              <div className={`addon-checkbox ${checked ? 'checked' : ''}`}>
                                {checked && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.nombre}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+{s.duracionMinutos} min · +${s.precio}</div>
                              </div>
                            </div>
                          </Col>
                        )
                      })}
                    </Row>
                  </div>
                )}
              </div>

              {/* Step 3: Date & time */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px', opacity: servicioBaseId ? 1 : 0.5 }}>
                <p className="step-label">Step 3</p>
                <h5 style={{ marginBottom: '16px' }}>Pick a date & time</h5>
                <div className="d-flex align-items-end gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={fecha}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setFecha(e.target.value); setHuecos([]); setHuecosConsultados(false); setHora('') }}
                      required
                      disabled={!servicioBaseId}
                      style={{ maxWidth: '200px' }}
                    />
                  </Form.Group>
                  <Button type="button" variant="outline-primary" onClick={cargarHuecos} disabled={!barberoId || !fecha || !duracionTotal || loadingHuecos}>
                    {loadingHuecos ? <><Spinner animation="border" size="sm" className="me-2" />Loading...</> : 'Search slots'}
                  </Button>
                </div>

                {loadingHuecos && <div className="text-center py-3"><Spinner animation="border" style={{ color: 'var(--gold)' }} /></div>}

                {!loadingHuecos && huecosConsultados && huecosFiltrados.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No available time slots for that day.</p>
                )}

                {!loadingHuecos && huecosFiltrados.length > 0 && (
                  <>
                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px', color: 'var(--text-muted)' }}>Available slots</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {huecosFiltrados.map(h => (
                        <button key={h.hora} type="button" onClick={() => setHora(h.hora)} className={`time-slot ${hora === h.hora ? 'selected' : ''}`}>
                          {h.hora}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Button type="submit" size="lg" variant="primary" disabled={loadingSubmit || !barberoId || !servicioBaseId || !fecha || !hora} style={{ width: '100%', padding: '14px' }}>
                {loadingSubmit ? <><Spinner animation="border" size="sm" className="me-2" />Confirming...</> : 'Confirm appointment'}
              </Button>
            </Form>
          </Col>

          {/* Summary */}
          <Col lg={4}>
            <div style={{ position: 'sticky', top: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '20px' }}>
                Summary
              </p>
              <div className="summary-row">
                <span className="summary-row-label">Barber</span>
                <span className="summary-row-value">{barberoSeleccionado ? `${barberoSeleccionado.nombre} ${barberoSeleccionado.apellido}` : '—'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Service</span>
                <div style={{ textAlign: 'right' }}>
                  <span className="summary-row-value">{servicioBase ? servicioBase.nombre : '—'}</span>
                  {addonIds.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      + {servicios.filter(s => addonIds.includes(s.id)).map(s => s.nombre).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Date & time</span>
                <span className="summary-row-value">{fecha && hora ? `${fecha} at ${hora}` : '—'}</span>
              </div>
              <hr style={{ borderColor: 'var(--border)', margin: '12px 0' }} />
              <div className="summary-row">
                <span className="summary-row-label">Duration</span>
                <Badge bg="secondary">{duracionTotal ? `${duracionTotal} min` : '—'}</Badge>
              </div>
              <div className="summary-row" style={{ marginTop: '8px' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="summary-total">${precioTotal}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
