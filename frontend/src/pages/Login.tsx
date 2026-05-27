import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useState } from 'react'
import { authService } from '../services/auth'
import { jwtDecode } from 'jwt-decode'
import { Button, Form, Spinner } from 'react-bootstrap'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await authService.login({ email, password })
      login(token)
      const decoded = jwtDecode<Record<string, string>>(token)
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded['role']
      if (role === 'admin') navigate('/admin')
      else if (role === 'barbero') navigate('/turnos-barbero')
      else navigate('/home')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Could not sign in'
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
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold)', fontSize: '1.6rem', marginBottom: '6px' }}>
            BarberShop
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          {error && (
            <div className="alert-danger" style={{
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
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading} className="w-100" style={{ padding: '12px' }}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Sign in'}
            </Button>
          </Form>

          <div className="mt-4 text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
