"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { FolderProvider } from "../contexts/folder-context"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { FileText, LogOut, User } from "lucide-react"
import FolderTree from "../components/folders/FolderTree"
import FolderBreadcrumb from "../components/folders/FolderBreadcrumb"
import CreateFolderModal from "../components/folders/CreateFolderModal"

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [showCreateFolder, setShowCreateFolder] = useState(false)

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">FileKeeper</h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  {user.firstName} {user.lastName}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Hello {user.firstName}! 👋</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Welcome to your FileKeeper dashboard.</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Account Information:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        <strong>Email:</strong> {user.email}
                      </li>
                      <li>
                        <strong>Role:</strong> {user.role}
                      </li>
                      <li>
                        <strong>ID:</strong> {user.id}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breadcrumb Navigation */}
            <FolderBreadcrumb />

            {/* Folders Section */}
            <FolderTree onCreateFolder={() => setShowCreateFolder(true)} />

            {/* Create Folder Modal */}
            <CreateFolderModal isOpen={showCreateFolder} onClose={() => setShowCreateFolder(false)} />
          </div>
        </main>
      </div>
    </FolderProvider>
  )
}
