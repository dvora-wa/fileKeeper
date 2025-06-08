import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useUiStore } from '../../store'
import { cn } from '../../utils'

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUiStore()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out pt-14',
            sidebarCollapsed ? 'mr-16' : 'mr-64'
          )}
        >
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}