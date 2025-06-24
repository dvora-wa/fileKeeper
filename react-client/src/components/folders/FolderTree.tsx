"use client"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Alert, AlertDescription } from "../ui/alert"
import { Folder, FolderOpen, Trash2, AlertCircle, Loader2, FolderPlus } from "lucide-react"
import { useFolders } from "../../contexts/folder-context"
import { formatDate } from "../../lib/utils"
import type { Folder as FolderType } from "../../types/api"

interface FolderTreeProps {
  onCreateFolder: () => void
}

export default function FolderTree({ onCreateFolder }: FolderTreeProps) {
  const { folders, loading, error, navigateToFolder, deleteFolder, currentFolder } = useFolders()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleFolderClick = (folder: FolderType) => {
    navigateToFolder(folder)
  }

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete "${folderName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(folderId)
      await deleteFolder(folderId)
    } catch (err) {
      console.error("Failed to delete folder:", err)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading && folders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading folders...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Folder className="w-5 h-5 mr-2 text-blue-600" />
          Folders
          {currentFolder && <span className="text-sm font-normal text-gray-500 ml-2">in "{currentFolder.name}"</span>}
        </CardTitle>
        <Button size="sm" onClick={onCreateFolder} className="bg-blue-600 hover:bg-blue-700">
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {folders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No folders yet</p>
            <p className="text-sm">Create your first folder to get started</p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={onCreateFolder}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group relative p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ backgroundColor: folder.color + "20" }}
                    >
                      <FolderOpen className="w-5 h-5" style={{ color: folder.color || "#3B82F6" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                      {folder.description && <p className="text-sm text-gray-500 truncate">{folder.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(folder.createdAt)}</p>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFolder(folder.id, folder.name)
                      }}
                      disabled={deletingId === folder.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === folder.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Folder stats */}
                <div className="mt-3 flex items-center text-xs text-gray-400 space-x-4">
                  <span>{folder.subFolders?.length || 0} folders</span>
                  <span>{folder.files?.length || 0} files</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
