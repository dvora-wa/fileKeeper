import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'

export const Toast: React.FC = () => {
  return (
    <HotToaster
      position="top-left"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '500px'
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))'
          }
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'hsl(var(--destructive-foreground))'
          }
        }
      }}
    />
  )
}