"use client"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { 
  Search, 
  Filter, 
  FileText, 
  ImageIcon, 
  Video, 
  Music, 
  FolderIcon
} from "lucide-react"

export default function SearchPage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

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
    navigate("/login")
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const filterOptions = [
    { id: "all", name: "All", icon: Search },
    { id: "documents", name: "Documents", icon: FileText },
    { id: "images", name: "Images", icon: ImageIcon },
    { id: "videos", name: "Videos", icon: Video },
    { id: "audio", name: "Audio", icon: Music },
    { id: "folders", name: "Folders", icon: FolderIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Search className="h-6 w-6 ml-2 text-blue-600" />
                Search Files and Folders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Input
                    placeholder="Search files, folders, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                {/* Filter Options */}
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={selectedFilter === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.id)}
                      className="flex items-center"
                    >
                      <filter.icon className="h-4 w-4 mr-2" />
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search Results</span>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Searching for "{searchTerm}"</p>
                  <p className="text-sm">Enter a search term to see results</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Enter a search term</p>
                  <p className="text-sm">Search files, folders, or content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}