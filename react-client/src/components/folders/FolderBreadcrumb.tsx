"use client"

import { Button } from "../ui/Button"
import { ChevronRight, Home } from "lucide-react"
import { useFolders } from "../../contexts/folder-context"

export default function FolderBreadcrumb() {
  const { breadcrumb, navigateToFolder } = useFolders()

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateToFolder(null)}
        className="flex items-center hover:bg-gray-100"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Button>

      {breadcrumb.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToFolder(folder)}
            className="hover:bg-gray-100"
            disabled={index === breadcrumb.length - 1} // Disable current folder
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
