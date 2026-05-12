import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button, Container, Nav, Navbar } from "react-bootstrap";

export function AppNavBar(){
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    TurnoApp
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar"/>
                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        {isAuthenticated && user?.rol == 'cliente' && (
                            <>
                                <Nav.Link as={Link} to="/mis-turnos">My appointments</Nav.Link>
                                <Nav.Link as={Link} to="/nuevo-turno">New appointment</Nav.Link>
                            </>
                        )}

                        {isAuthenticated && user?.rol === 'barbero' && (
                            <Nav.Link as={Link} to="/turnos-barbero">My appointments</Nav.Link>
                        )}

                        {isAuthenticated && user?.rol === 'admin' && (
                        <>
                            <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                            <Nav.Link as={Link} to="/admin/barberos">Barbers</Nav.Link>
                            <Nav.Link as={Link} to="/admin/servicios">Services</Nav.Link>
                            <Nav.Link as={Link} to="/admin/horarios">Schedules</Nav.Link>
                        </>
                        )}
                    </Nav>

                    <Nav className="ms-auto align-items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Navbar.Text>{user?.email}</Navbar.Text>
                                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse> 
            </Container>
        </Navbar>
    )
}