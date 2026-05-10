import { useState } from "react";
import { authService } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";

export function Register(){
    const navigate = useNavigate()
    const {login} = useAuth()

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try{
            const {token} = await authService.registro({nombre, apellido, email, password})
            login(token)
            navigate('/')
        }catch(err: unknown){
            const message = (err as {response?: {data?: {message?: string}}})?.response?.data?.message ?? 'No se pudo registrar'
            setError(message)
        } finally{
            setLoading(false)
        }
    }

    return (
        <Container fluid className="py-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={5} xl={4}>
              <Card>
                <Card.Body>
                  <Card.Title className="mb-4">Crear cuenta</Card.Title>
      
                  {error && <Alert variant="danger">{error}</Alert>}
      
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="regNombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </Form.Group>
      
                    <Form.Group className="mb-3" controlId="regApellido">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                    </Form.Group>
      
                    <Form.Group className="mb-3" controlId="regEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Form.Group>
      
                    <Form.Group className="mb-3" controlId="regPassword">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                    </Form.Group>
      
                    <Button type="submit" variant="primary" disabled={loading} className="w-100">
                      {loading ? <Spinner size="sm" animation="border" /> : 'Crear cuenta'}
                    </Button>
                  </Form>
      
                  <div className="mt-3 text-center">
                    ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )
}



