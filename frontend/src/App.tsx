import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home, Placeholder } from './pages/Home'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppNavBar } from './components/Navbar'
import { MisTurnos } from './pages/MisTurnos'
import { TurnosBarbero } from './pages/TurnosBarbero'
import { Dashboard } from './pages/admin/Dashboard'
import { NuevoTurno } from './pages/NuevoTurno'

function App() {
  return(
    <>
    <AppNavBar/>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/mis-turnos" element={<MisTurnos/>} />
        <Route path="/nuevo-turno" element={<NuevoTurno/>} />
        <Route path="/turnos-barbero" element={<TurnosBarbero/>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<Dashboard/>} />
        <Route path="/admin/barberos" element={<Placeholder titulo="Admin Barberos" />} />
        <Route path="/admin/servicios" element={<Placeholder titulo="Admin Servicios" />} />
        <Route path="/admin/horarios" element={<Placeholder titulo="Admin Horarios" />} />
      </Route>

      <Route path="*" element={<Placeholder titulo="404 - Página no encontrada" />} />
    </Routes>
    </>
  )
}
export default App