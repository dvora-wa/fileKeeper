import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui'
import { useAuthStore } from '../../store'
// import { RegisterDto } from '../../types'

const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'שם פרטי חייב להיות לפחות 2 תווים')
    .max(50, 'שם פרטי ארוך מדי')
    .regex(/^[a-zA-Zא-ת\s]+$/, 'שם פרטי יכול להכיל רק אותיות ורווחים'),
  lastName: z
    .string()
    .min(2, 'שם משפחה חייב להיות לפחות 2 תווים')
    .max(50, 'שם משפחה ארוך מדי')
    .regex(/^[a-zA-Zא-ת\s]+$/, 'שם משפחה יכול להכיל רק אותיות ורווחים'),
  email: z
    .string()
    .min(1, 'כתובת מייל נדרשת')
    .email('כתובת מייל לא תקינה')
    .max(100, 'כתובת מייל ארוכה מדי'),
  password: z
    .string()
    .min(6, 'סיסמה חייבת להיות לפחות 6 תווים')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'סיסמה חייבת להכיל לפחות אות גדולה, אות קטנה ומספר'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'אישור סיסמה לא תואם',
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data)
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
          <p className="text-muted-foreground">צור חשבון חדש</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="שם פרטי"
                placeholder="שם פרטי"
                leftIcon={<User size={16} />}
                error={errors.firstName?.message}
                autoComplete="given-name"
              />

              <Input
                {...register('lastName')}
                label="שם משפחה"
                placeholder="שם משפחה"
                leftIcon={<User size={16} />}
                error={errors.lastName?.message}
                autoComplete="family-name"
              />
            </div>

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
              placeholder="בחר סיסמה חזקה"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              autoComplete="new-password"
              dir="ltr"
              hint="לפחות 6 תווים עם אות גדולה, קטנה ומספר"
            />

            <Input
              {...register('confirmPassword')}
              type="password"
              label="אישור סיסמה"
              placeholder="הכנס שוב את הסיסמה"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              dir="ltr"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              הירשם
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">יש לך כבר חשבון? </span>
              <Link
                to="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                התחבר כאן
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}