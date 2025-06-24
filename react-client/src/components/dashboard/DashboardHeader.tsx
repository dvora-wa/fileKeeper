"use client"

import { Button } from "../ui/Button"
import { FileText, LogOut, User } from "lucide-react"
import type { User as UserType } from "../../types/api"

interface DashboardHeaderProps {
  user: UserType
  onLogout: () => void
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
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
            <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
