import { Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home, Placeholder } from './pages/Home'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppNavBar } from './components/Navbar'
import { MisTurnos } from './pages/MisTurnos'
import { TurnosBarbero } from './pages/TurnosBarbero'
import { Dashboard } from './pages/admin/Dashboard'
import { AdminServicios } from './pages/admin/AdminServicios'
import { AdminBarberos } from './pages/admin/AdminBarberos'
import { AdminHorarios } from './pages/admin/AdminHorarios'
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
        <Route path="/admin/barberos" element={<AdminBarberos />} />
        <Route path="/admin/servicios" element={<AdminServicios />} />
        <Route path="/admin/horarios" element={<AdminHorarios />} />
      </Route>

      <Route path="*" element={<Placeholder titulo="404 - Página no encontrada" />} />
    </Routes>
    </>
  )
}
export default App