import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../../store'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../ui'

// import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
// import { useAuthStore } from '@/store'
// import { LoginDto } from '@/types'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'כתובת מייל נדרשת')
    .email('כתובת מייל לא תקינה'),
  password: z
    .string()
    .min(1, 'סיסמה נדרשת'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store and displayed via toast
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            FileKeeper
          </CardTitle>
          <p className="text-muted-foreground">התחבר לחשבון שלך</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              type="email"
              label="כתובת מייל"
              placeholder="הכנס את כתובת המייל שלך"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              dir="ltr"
            />

            <Input
              {...register('password')}
              type="password"
              label="סיסמה"
              placeholder="הכנס את הסיסמה שלך"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              autoComplete="current-password"
              dir="ltr"
            />

            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="mr-2 text-sm text-muted-foreground">
                זכור אותי
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              התחבר
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">אין לך חשבון? </span>
              <Link
                to="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                הירשם כאן
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
