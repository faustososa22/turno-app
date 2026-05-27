import { useState } from 'react'
import { authService } from '../services/auth'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { jwtDecode } from 'jwt-decode'
import { Button, Form, Spinner } from 'react-bootstrap'

export function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await authService.registro({ nombre, apellido, email, password })
      login(token)
      const decoded = jwtDecode<Record<string, string>>(token)
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded['role']
      if (role === 'admin') navigate('/admin')
      else if (role === 'barbero') navigate('/turnos-barbero')
      else navigate('/home')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not register'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold)', fontSize: '1.6rem', marginBottom: '6px' }}>
            BarberShop
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Create your account</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(224,85,85,0.1)',
              border: '1px solid rgba(224,85,85,0.25)',
              color: '#f08080',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-3 mb-3">
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>First name</Form.Label>
                <Form.Control value={nombre} onChange={e => setNombre(e.target.value)} required />
              </Form.Group>
              <Form.Group style={{ flex: 1 }}>
                <Form.Label>Last name</Form.Label>
                <Form.Control value={apellido} onChange={e => setApellido(e.target.value)} required />
              </Form.Group>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading} className="w-100" style={{ padding: '12px' }}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Create account'}
            </Button>
          </Form>

          <div className="mt-4 text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
