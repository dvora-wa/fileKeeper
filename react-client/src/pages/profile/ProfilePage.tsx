import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Lock, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '../../components/ui'
import { useAuth } from '../../hooks'
import { usersApi } from '../../services/api'
import { toast } from 'react-hot-toast'
import { DocumentHead } from '../../components/DocumentHead'

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'שם פרטי חייב להיות לפחות 2 תווים')
    .max(50, 'שם פרטי ארוך מדי'),
  lastName: z
    .string()
    .min(2, 'שם משפחה חייב להיות לפחות 2 תווים')
    .max(50, 'שם משפחה ארוך מדי'),
  email: z
    .string()
    .min(1, 'כתובת מייל נדרשת')
    .email('כתובת מייל לא תקינה')
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'סיסמה נוכחית נדרשת'),
  newPassword: z
    .string()
    .min(6, 'סיסמה חדשה חייבת להיות לפחות 6 תווים')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'סיסמה חדשה חייבת להכיל אות גדולה, קטנה ומספר'
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'אישור סיסמה לא תואם',
  path: ['confirmPassword']
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth()
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const onUpdateProfile = async (data: ProfileFormData) => {
    if (!user) return

    setIsUpdatingProfile(true)
    try {
      await usersApi.updateUser(user.id, data)

      // Update user in store
      setUser({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        fullName: `${data.firstName} ${data.lastName}`
      })

      toast.success('הפרופיל עודכן בהצלחה')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'שגיאה בעדכון הפרופיל')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onUpdatePassword = async (data: PasswordFormData) => {
    if (!user) return

    setIsUpdatingPassword(true)
    try {
      await usersApi.updateUser(user.id, {
        password: data.newPassword,
        confirmPassword: data.confirmPassword
      })

      passwordForm.reset()
      toast.success('הסיסמה עודכנה בהצלחה')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'שגיאה בעדכון הסיסמה')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <>
      <DocumentHead
        title="פרופיל אישי - FileKeeper"
        description="נהל את הפרופיל האישי שלך"
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">פרופיל אישי</h1>
          <p className="text-muted-foreground">נהל את פרטי החשבון שלך</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              פרטים אישיים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...profileForm.register('firstName')}
                  label="שם פרטי"
                  placeholder="הכנס שם פרטי"
                  error={profileForm.formState.errors.firstName?.message}
                />

                <Input
                  {...profileForm.register('lastName')}
                  label="שם משפחה"
                  placeholder="הכנס שם משפחה"
                  error={profileForm.formState.errors.lastName?.message}
                />
              </div>

              <Input
                {...profileForm.register('email')}
                type="email"
                label="כתובת מייל"
                placeholder="הכנס כתובת מייל"
                leftIcon={<Mail size={16} />}
                error={profileForm.formState.errors.email?.message}
                dir="ltr"
              />

              <Button
                type="submit"
                loading={isUpdatingProfile}
                leftIcon={<Save size={16} />}
              >
                שמור שינויים
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              שינוי סיסמה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
              <Input
                {...passwordForm.register('currentPassword')}
                type="password"
                label="סיסמה נוכחית"
                placeholder="הכנס את הסיסמה הנוכחית"
                error={passwordForm.formState.errors.currentPassword?.message}
                dir="ltr"
              />

              <Input
                {...passwordForm.register('newPassword')}
                type="password"
                label="סיסמה חדשה"
                placeholder="הכנס סיסמה חדשה"
                error={passwordForm.formState.errors.newPassword?.message}
                dir="ltr"
                hint="לפחות 6 תווים עם אות גדולה, קטנה ומספר"
              />

              <Input
                {...passwordForm.register('confirmPassword')}
                type="password"
                label="אישור סיסמה חדשה"
                placeholder="הכנס שוב את הסיסמה החדשה"
                error={passwordForm.formState.errors.confirmPassword?.message}
                dir="ltr"
              />

              <Button
                type="submit"
                loading={isUpdatingPassword}
                leftIcon={<Lock size={16} />}
              >
                עדכן סיסמה
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>מידע חשבון</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">תפקיד:</span>
              <span className="font-medium">{user?.role}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">תאריך הצטרפות:</span>
              <span className="font-medium">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('he-IL')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">כניסה אחרונה:</span>
              <span className="font-medium">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('he-IL') : 'לא זמין'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">סטטוס חשבון:</span>
              <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user?.isActive ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}