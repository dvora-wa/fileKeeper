"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import CreateFolderModal from "../folders/CreateFolderModal"
import { useFolders } from "../../contexts/folder-context"
import { 
  BarChart3, 
  FolderIcon, 
  FileText, 
  HardDrive, 
  Download,
  Upload,
  TrendingUp,
  Calendar,
  Activity,
  Clock
} from "lucide-react"

export default function DashboardContent() {
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const { folders } = useFolders()

  // Mock statistics data - in real app, this would come from API
  const stats = [
    {
      title: "Total Folders",
      value: folders.length.toString(),
      change: "+3",
      changeType: "increase",
      icon: FolderIcon,
      color: "blue",
      description: "Active folders"
    },
    {
      title: "Total Files", 
      value: "156",
      change: "+12",
      changeType: "increase",
      icon: FileText,
      color: "green", 
      description: "Files in total"
    },
    {
      title: "Storage Used",
      value: "2.3 GB",
      change: "+0.5 GB", 
      changeType: "increase",
      icon: HardDrive,
      color: "purple",
      description: "out of 10 GB"
    },
    {
      title: "Monthly Downloads",
      value: "89",
      change: "+23",
      changeType: "increase", 
      icon: Download,
      color: "orange",
      description: "This month"
    }
  ]

  const recentActivity = [
    { action: "Upload", file: "Annual Report.pdf", time: "1 hour ago", type: "upload" },
    { action: "Download", file: "Vacation Photos.zip", time: "3 hours ago", type: "download" },
    { action: "Create Folder", file: "New Project", time: "Yesterday", type: "folder" },
    { action: "Upload", file: "Work Presentation.pptx", time: "Yesterday", type: "upload" },
  ]


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Dashboard - FileKeeper 📊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-2">
                Welcome! Here you can view your statistics and manage your folders and files
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Last updated: {new Date().toLocaleDateString('en-US')}
              </div>
            </div>
            <div className="hidden md:block">
              <Activity className="h-16 w-16 text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm flex items-center mt-2 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change} this week
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <HardDrive className="h-5 w-5 mr-2 text-blue-600" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>2.3 GB of 10 GB</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Documents</span>
                  </div>
                  <span className="text-sm text-gray-600">1.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Images</span>
                  </div>
                  <span className="text-sm text-gray-600">0.8 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm">Other</span>
                  </div>
                  <span className="text-sm text-gray-600">0.3 GB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'upload' ? 'bg-green-100' :
                    activity.type === 'download' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'upload' && <Upload className="h-4 w-4 text-green-600" />}
                    {activity.type === 'download' && <Download className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'folder' && <FolderIcon className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.file}</p>
                  </div>
                  <div className="text-xs text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folders Section with Navigation */}

      {/* Create Folder Modal */}
      <CreateFolderModal 
        isOpen={showCreateFolder} 
        onClose={() => setShowCreateFolder(false)} 
      />
    </div>
  )
}