"use client"

import { useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { FolderProvider } from "../contexts/folder-context"
import { FileProvider } from "../contexts/file-context"
import { useNavigate } from "react-router-dom"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import DashboardContent from "../components/dashboard/DashboardContent"

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login")
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <FolderProvider>
      <FileProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <DashboardHeader user={user} onLogout={handleLogout} />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <DashboardContent />
            </div>
          </main>
        </div>
      </FileProvider>
    </FolderProvider>
  )
}
