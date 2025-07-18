"use client"

import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { 
  FileText, 
  ArrowRight, 
  Shield, 
  Zap, 
  Cloud, 
  Users, 
  Search, 
  Share, 
  Menu,
  X,
  Folder,
  Upload,
  BarChart3,
  Settings
} from "lucide-react"

export default function HomePage() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Don't auto-redirect logged in users - let them see the home page
    // They can manually navigate to dashboard if they want
  }, [user, loading])

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const navigationItems = [
    { name: "Folders", href: "/folders", icon: Folder, description: "Manage your folders" },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, description: "View statistics" },
    { name: "Settings", href: "/settings", icon: Settings, description: "Personal settings" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">FileKeeper</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Navigation Menu for Logged In Users */}
                  <div className="flex items-center space-x-2">
                    {navigationItems.map((item) => (
                      <Link key={item.name} to={item.href}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center"
                          title={item.description}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  
                  {/* User Info & Logout */}
                  <span className="text-sm text-gray-700">
                    Hello, {user.firstName}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {user ? (
                <>
                  <div className="text-sm text-gray-700 border-b border-gray-200 pb-3">
                    Hello, {user.firstName} {user.lastName}
                  </div>
                  
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.name} 
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                </div>

                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Welcome to</span>
                  <span className="block text-blue-600">FileKeeper</span>
                </h1>

                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Your advanced file management system. Organize, manage, and share your files securely in the cloud.
                  Fast uploads, smart search, and access from anywhere.
                </p>

                {/* Action Buttons */}
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {user ? (
                    // Logged in user - show navigation to main features
                    <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                      <Link to="/folders">
                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                          <Folder className="ml-2 h-5 w-5" />
                          Manage Folders
                        </Button>
                      </Link>
                      <Link to="/dashboard">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          <BarChart3 className="ml-2 h-5 w-5" />
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    // Not logged in - show register/login
                    <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                      <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                          Get Started Free
                          <ArrowRight className="mr-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Quick Navigation for Logged In Users */}
      {user && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Quick Navigation
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Access main system features quickly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {navigationItems.map((item) => (
                <Link key={item.name} to={item.href}>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-blue-300">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mr-4 text-lg font-medium text-gray-900">{item.name}</h3>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section (for non-logged in users) */}
      {!user && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for file management
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                FileKeeper provides all the tools you need to organize, secure, and share your files efficiently.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Advanced Security</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    End-to-end encryption, two-factor authentication, and automatic backups for all your files.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Lightning Fast</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    Ultra-fast uploads and downloads, instant search, and quick response times.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Cloud Access</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    Access your files from any device, anywhere in the world, anytime.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Team Collaboration</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    Share folders and files with team members with granular permission controls.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Smart Search</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    Find files instantly with advanced search filters by name, type, date, and tags.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Share className="h-6 w-6" />
                  </div>
                  <p className="mr-16 text-lg leading-6 font-medium text-gray-900">Easy Sharing</p>
                  <p className="mt-2 mr-16 text-base text-gray-500">
                    Generate secure sharing links with expiration dates and access controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-semibold">FileKeeper</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            © 2024 FileKeeper. All rights reserved. Your files, securely managed.
          </p>
        </div>
      </footer>
    </div>
  )
}