import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { Button, Input } from '../ui'
import { useAuthStore, useUiStore } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { toggleSidebar, theme, toggleTheme } = useUiStore()
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />
      case 'dark':
        return <Moon size={16} />
      default:
        return <Monitor size={16} />
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu size={16} />
          </Button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FK</span>
            </div>
            <span className="hidden sm:inline-block font-semibold">FileKeeper</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="search"
              placeholder="חפש קבצים, תיקיות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="החלף ערכת נושא"
          >
            {getThemeIcon()}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            title="התראות"
          >
            <Bell size={16} />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative"
            >
              <User size={16} />
            </Button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute left-0 top-full mt-2 w-64 rounded-md border bg-popover p-1 shadow-md z-20"
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        פרופיל אישי
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        הגדרות
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-sm w-full text-right text-destructive"
                      >
                        <LogOut size={16} />
                        התנתק
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}