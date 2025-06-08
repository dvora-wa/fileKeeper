import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Folder,
  Upload,
  Download,
  TrendingUp,
  Clock,
  Star,
  HardDrive
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { motion } from 'framer-motion'
import { useAuth, useFiles, useFolders } from '../../hooks'
import { DocumentHead } from '../../components/DocumentHead'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ size?: number }>
  color: string
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <span className={`text-xs px-2 py-1 rounded-full ${change.type === 'increase'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                  {change.type === 'increase' ? '+' : '-'}{change.value}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { folders } = useFolders()
  const { files } = useFiles()

  // Mock statistics - in real app, fetch from API
  const stats = {
    totalFiles: files?.length || 0,
    totalFolders: folders?.length || 0,
    totalStorage: '2.4 GB',
    storageUsed: 65, // percentage
    recentUploads: 12,
    downloads: 45
  }

  return (
    <>
      <DocumentHead
        title="דשבורד - FileKeeper"
        description="דשבורד ניהול הקבצים שלך"
      />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">שלום, {user?.firstName}!</h1>
            <p className="text-muted-foreground">
              ברוך הבא למערכת ניהול הקבצים שלך
            </p>
          </div>

          <Button leftIcon={<Upload size={16} />} size="lg">
            העלה קבצים
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="סך הקבצים"
            value={stats.totalFiles}
            icon={FileText}
            color="bg-blue-500"
            change={{ value: 12, type: 'increase' }}
          />

          <StatCard
            title="תיקיות"
            value={stats.totalFolders}
            icon={Folder}
            color="bg-green-500"
            change={{ value: 3, type: 'increase' }}
          />

          <StatCard
            title="העלאות השבוע"
            value={stats.recentUploads}
            icon={TrendingUp}
            color="bg-purple-500"
            change={{ value: 8, type: 'increase' }}
          />

          <StatCard
            title="הורדות השבוע"
            value={stats.downloads}
            icon={Download}
            color="bg-orange-500"
            change={{ value: 5, type: 'decrease' }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive size={20} />
                שימוש באחסון
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">בשימוש</span>
                  <span className="font-medium">{stats.totalStorage}</span>
                </div>

                <div className="w-full bg-muted rounded-full h-3">
                  <motion.div
                    className="bg-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.storageUsed}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stats.storageUsed}% בשימוש</span>
                  <span className="text-muted-foreground">מתוך 10 GB</span>
                </div>

                <Button variant="outline" className="w-full">
                  שדרג תוכנית
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                קבצים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files?.slice(0, 5).map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                    <FileText size={16} className="text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.sizeFormatted}</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      אין קבצים עדיין
                    </p>
                  )}

                <Link to="/files">
                  <Button variant="outline" className="w-full">
                    צפה בכל הקבצים
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/upload">
                  <Button className="w-full justify-start" leftIcon={<Upload size={16} />}>
                    העלה קבצים
                  </Button>
                </Link>

                <Link to="/folders/new">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Folder size={16} />}>
                    צור תיקייה חדשה
                  </Button>
                </Link>

                <Link to="/search">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<FileText size={16} />}>
                    חפש קבצים
                  </Button>
                </Link>

                <Link to="/favorites">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Star size={16} />}>
                    מועדפים
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
