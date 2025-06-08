import React from 'react'
import { LoginForm } from '../../components/auth'
import { DocumentHead } from '../../components/DocumentHead'


export const LoginPage: React.FC = () => {
  return (
    <>
      <DocumentHead
        title="התחברות - FileKeeper"
        description="התחבר לחשבון FileKeeper שלך"
      />
      <LoginForm />
    </>
  )
}
