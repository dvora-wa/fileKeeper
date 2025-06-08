import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DocumentHead } from './components/DocumentHead'
import { Toast } from './components/ui'
import './styles/globals.css'
import { AppRoutes } from './routes/AppRoutes'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false
        }
        return failureCount < 3
      }
    }
  }
})

const App: React.FC = () => {
  return (
    <>
      <DocumentHead
        title="FileKeeper - ניהול קבצים מתקדם"
        description="מערכת ניהול קבצים מתקדמת ובטוחה"
        keywords="ניהול קבצים, אחסון, בטיחות, FileKeeper"
      />
      
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
          <Toast />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </Router>
      </QueryClientProvider>
    </>
  )
}

export default App