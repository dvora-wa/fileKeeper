import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Folder,
  FileText,
  Search,
  Star,
  Trash2,
  Settings,
  BarChart3,
  Upload,
  ChevronLeft
} from 'lucide-react'
import { Button } from '../ui'
import { useUiStore, useFoldersStore } from '../../store'
import { cn } from '../../utils'

interface SidebarItem {
  icon: React.ComponentType<{ size?: number }>
  label: string
  path: string
  badge?: number
}

const mainItems: SidebarItem[] = [
  { icon: Home, label: 'דשבורד', path: '/dashboard' },
  { icon: FileText, label: 'הקבצים שלי', path: '/files' },
  { icon: Folder, label: 'תיקיות', path: '/folders' },
  { icon: Search, label: 'חיפוש', path: '/search' },
  { icon: Star, label: 'מועדפים', path: '/favorites' },
  { icon: Trash2, label: 'סל מחזור', path: '/trash' }
]

const bottomItems: SidebarItem[] = [
  { icon: BarChart3, label: 'סטטיסטיקות', path: '/stats' },
  { icon: Settings, label: 'הגדרות', path: '/settings' }
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { folders } = useFoldersStore()

  const isActive = (path: string) => location.pathname === path

  const SidebarLink: React.FC<{ item: SidebarItem }> = ({ item }) => {
    const active = isActive(item.path)
    
    return (
      <Link to={item.path}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative',
            active
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <item.icon size={20} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.aside
      animate={{
        width: sidebarCollapsed ? 64 : 256
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-background border-l flex flex-col z-30"
    >
      {/* Toggle Button */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'w-full',
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <ChevronLeft
            size={16}
            className={cn(
              'transition-transform',
              sidebarCollapsed && 'rotate-180'
            )}
          />
          {!sidebarCollapsed && <span className="mr-2">סגור</span>}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </div>

        {/* Quick Upload */}
        {!sidebarCollapsed && (
          <div className="mt-6">
            <Button className="w-full" leftIcon={<Upload size={16} />}>
              העלה קבצים
            </Button>
          </div>
        )}

        {/* Recent Folders */}
        {!sidebarCollapsed && folders.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
              תיקיות אחרונות
            </h3>
            <div className="space-y-1">
              {folders.slice(0, 5).map((folder) => (
                <Link
                  key={folder.id}
                  to={`/folders/${folder.id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Folder size={16} style={{ color: folder.color }} />
                  <span className="text-sm truncate">{folder.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
