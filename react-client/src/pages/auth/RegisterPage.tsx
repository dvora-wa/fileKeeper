import React from 'react'
import { RegisterForm } from '../../components/auth'
import { DocumentHead } from '../../components/DocumentHead'

export const RegisterPage: React.FC = () => {
  return (
    <>
      <DocumentHead
        title="הרשמה - FileKeeper"
        description="צור חשבון חדש ב-FileKeeper"
      />
      <RegisterForm />
    </>
  )
}
