import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/services/authService'
import { useState } from 'react'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await login(data.email, data.password)
      authLogin(response.token)
      navigate('/')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div>
              <Input type="email" placeholder="Email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className='mb-4'>
              <Input type="password" placeholder="Password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="space-x-2">
            <Button type="submit">Login</Button>
            <Button variant="outline">Forgot Password</Button>
          </CardFooter>
        </form>
      </Card>
      <Link to="/register" className="text-sm text-blue-500 hover:underline">
        You don't have an account? Register here.
      </Link>
    </div>
  )
}