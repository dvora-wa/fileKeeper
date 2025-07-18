"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "../ui/Button"
import { 
  FileText, 
  LogOut, 
  User, 
  Menu,
  X,
  Folder,
  Upload,
  BarChart3,
  Settings,
  Home,
  Search,
  Archive
} from "lucide-react"
import type { User as UserType } from "../../types/api"

interface DashboardHeaderProps {
  user: UserType
  onLogout: () => void
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Folders", href: "/folders", icon: Folder },
    { name: "Search", href: "/search", icon: Search },
    { name: "Archive", href: "/archive", icon: Archive },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const isCurrentPage = (href: string) => {
    return location.pathname === href
  }

  const handleNavigation = (href: string) => {
    navigate(href)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">FileKeeper</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  variant={isCurrentPage(item.href) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center ${
                    isCurrentPage(item.href) 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              ))}
            </nav>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* User Info - Hidden on small screens */}
              <div className="hidden md:flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                {user.firstName} {user.lastName}
              </div>

              {/* Logout Button - Hidden on small screens */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout} 
                className="hidden md:flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>

              {/* Mobile menu button */}
              <div className="lg:hidden">
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
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {/* User Info */}
              <div className="flex items-center text-sm text-gray-700 border-b border-gray-200 pb-3 mb-3">
                <User className="h-4 w-4 mr-2" />
                <span>{user.firstName} {user.lastName}</span>
                <span className="text-xs text-gray-500 mr-2">({user.email})</span>
              </div>
              
              {/* Navigation Items */}
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  variant={isCurrentPage(item.href) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isCurrentPage(item.href) 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Button>
              ))}
              
              {/* Logout Button */}
              <div className="pt-3 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    onLogout()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>


    </>
  )
}