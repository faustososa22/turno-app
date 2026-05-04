import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { register } from '@/services/authService'
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const [serverError, setServerError] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await register(data.name, data.surname, data.email, data.password);
      authLogin(response.token)
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e.response?.data?.message || 'Error creating account')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-2">
            {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            <div>
              <Input type="text" placeholder="Name" {...formRegister('name')} />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input type="text" placeholder="Last Name" {...formRegister('surname')} />
              {errors.surname && <p className="text-sm text-red-500 mt-1">{errors.surname.message}</p>}
            </div>
            <div>
              <Input type="email" placeholder="Email" {...formRegister('email')} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="mb-4">
              <Input type="password" placeholder="Password" {...formRegister('password')} />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="space-x-2">
            <Button type="submit">Register</Button>
            <Button variant="outline" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}