import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useState } from 'react'

export function AppNavBar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const navLinkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? 'var(--gold)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: isActive(path) ? 600 : 400,
    padding: '6px 12px',
    borderRadius: '6px',
    background: isActive(path) ? 'var(--gold-dim)' : 'transparent',
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
  })

  const initials = user?.nombre
    ? user.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '100%',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '24px' }}>
          <span style={{
            color: 'var(--gold)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.02em',
          }}>
            BarberShop
          </span>
        </Link>

        <div className="d-none d-lg-flex align-items-center gap-1 flex-grow-1">
          {isAuthenticated && user?.rol === 'cliente' && (
            <>
              <Link to="/home" style={navLinkStyle('/home')}>Home</Link>
              <Link to="/mis-turnos" style={navLinkStyle('/mis-turnos')}>My appointments</Link>
              <Link to="/nuevo-turno" style={navLinkStyle('/nuevo-turno')}>Book</Link>
            </>
          )}
          {isAuthenticated && user?.rol === 'barbero' && (
            <Link to="/turnos-barbero" style={navLinkStyle('/turnos-barbero')}>My appointments</Link>
          )}
          {isAuthenticated && user?.rol === 'admin' && (
            <>
              <Link to="/admin" style={navLinkStyle('/admin')}>Dashboard</Link>
              <Link to="/admin/barberos" style={navLinkStyle('/admin/barberos')}>Barbers</Link>
              <Link to="/admin/servicios" style={navLinkStyle('/admin/servicios')}>Services</Link>
              <Link to="/admin/horarios" style={navLinkStyle('/admin/horarios')}>Schedules</Link>
            </>
          )}
        </div>

        <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--gold-dim)',
                  border: '1px solid var(--gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold)', fontWeight: 700, fontSize: '12px',
                }}>
                  {initials}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {user?.nombre || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold-border)'
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                background: 'var(--gold)', color: '#111', borderRadius: '6px',
                padding: '6px 16px', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              }}>
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="d-lg-none ms-auto"
          onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="d-lg-none" style={{
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
          padding: '12px 24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {isAuthenticated && user?.rol === 'cliente' && (
            <>
              <MobileLink to="/home" label="Home" active={isActive('/home')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/mis-turnos" label="My appointments" active={isActive('/mis-turnos')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/nuevo-turno" label="Book appointment" active={isActive('/nuevo-turno')} onClick={() => setMenuOpen(false)} />
            </>
          )}
          {isAuthenticated && user?.rol === 'barbero' && (
            <MobileLink to="/turnos-barbero" label="My appointments" active={isActive('/turnos-barbero')} onClick={() => setMenuOpen(false)} />
          )}
          {isAuthenticated && user?.rol === 'admin' && (
            <>
              <MobileLink to="/admin" label="Dashboard" active={isActive('/admin')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/admin/barberos" label="Barbers" active={isActive('/admin/barberos')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/admin/servicios" label="Services" active={isActive('/admin/servicios')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/admin/horarios" label="Schedules" active={isActive('/admin/horarios')} onClick={() => setMenuOpen(false)} />
            </>
          )}
          {!isAuthenticated && (
            <>
              <MobileLink to="/login" label="Login" active={isActive('/login')} onClick={() => setMenuOpen(false)} />
              <MobileLink to="/register" label="Register" active={isActive('/register')} onClick={() => setMenuOpen(false)} />
            </>
          )}
          {isAuthenticated && (
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
                {user?.nombre || user?.email}
              </div>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid var(--border-light)',
                color: 'var(--text-muted)', borderRadius: '6px', padding: '8px 16px',
                fontSize: '13px', cursor: 'pointer', width: '100%',
              }}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

function MobileLink({ to, label, active, onClick }: { to: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} style={{
      color: active ? 'var(--gold)' : 'var(--text-muted)',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: active ? 600 : 400,
      padding: '10px 12px',
      borderRadius: '6px',
      background: active ? 'var(--gold-dim)' : 'transparent',
    }}>
      {label}
    </Link>
  )
}
