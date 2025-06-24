"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import FolderTree from "../folders/FolderTree"
import FolderBreadcrumb from "../folders/FolderBreadcrumb"
import CreateFolderModal from "../folders/CreateFolderModal"
import FilesList from "../files/FilesList"
import UploadSection from "./UploadSection"
import { useFolders } from "../../contexts/folder-context"
import { useFiles } from "../../contexts/file-context"

export default function DashboardContent() {
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const { currentFolder } = useFolders()
  const { loadFiles } = useFiles()

  // Load files when entering a folder
  useEffect(() => {
    if (currentFolder) {
      loadFiles(currentFolder.id)
    }
  }, [currentFolder, loadFiles])

  const handleToggleUpload = () => {
    setShowUpload(!showUpload)
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">File Management Dashboard 📁</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {currentFolder ? `Managing files in "${currentFolder.name}"` : "Manage your files and folders"}
          </p>
        </CardContent>
      </Card>

      {/* Breadcrumb Navigation */}
      <FolderBreadcrumb />

      {/* Folders Section */}
      <FolderTree onCreateFolder={() => setShowCreateFolder(true)} />

      {/* Files Section - Show when inside a folder */}
      {currentFolder && (
        <div className="space-y-6">
          {/* Upload Section */}
          <UploadSection
            currentFolderName={currentFolder.name}
            currentFolderId={currentFolder.id}
            showUpload={showUpload}
            onToggleUpload={handleToggleUpload}
            onUploadComplete={handleUploadComplete}
          />

          {/* Files List */}
          <FilesList folderId={currentFolder.id} onUploadClick={handleToggleUpload} />
        </div>
      )}

      {/* Modals */}
      <CreateFolderModal isOpen={showCreateFolder} onClose={() => setShowCreateFolder(false)} />
    </div>
  )
}
