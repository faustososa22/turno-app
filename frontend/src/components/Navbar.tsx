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
    color: isActive(path) ? 'white' : 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive(path) ? 600 : 400,
    padding: '6px 12px',
    borderRadius: '6px',
    background: isActive(path) ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s',
  })

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
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
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>
            TurnoApp
          </span>
        </Link>

        {/* Nav links — desktop */}
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

        {/* Right side — desktop */}
        <div className="d-none d-lg-flex align-items-center gap-3 ms-auto">
          {isAuthenticated ? (
            <>
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '12px',
                }}>
                  {initials}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  {user?.nombre || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{
                background: 'white', color: '#0f3460', borderRadius: '6px',
                padding: '6px 14px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="d-lg-none ms-auto"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: 'none', border: 'none', color: 'white',
            fontSize: '20px', cursor: 'pointer', padding: '4px 8px',
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="d-lg-none" style={{
          background: '#0f3460',
          borderTop: '1px solid rgba(255,255,255,0.1)',
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>
                {user?.nombre || user?.email}
              </div>
              <button onClick={handleLogout} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', borderRadius: '6px', padding: '8px 16px',
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
    <Link
      to={to}
      onClick={onClick}
      style={{
        color: active ? 'white' : 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: active ? 600 : 400,
        padding: '10px 12px',
        borderRadius: '6px',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
      }}
    >
      {label}
    </Link>
  )
}
