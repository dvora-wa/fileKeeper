// src/pages/NotFoundPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="text-6xl font-bold text-primary">404</div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">הדף לא נמצא</h1>
          <p className="text-muted-foreground">
            מצטערים, הדף שחיפשת לא קיים או הועבר למיקום אחר
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard">
            <Button leftIcon={<Home size={16} />}>
              חזור לדשבורד
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => window.history.back()}
          >
            חזור אחורה
          </Button>
        </div>
      </div>
    </div>
  )
}