"use client"

import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
// react-client/src/components/files/FilesList.tsx (updated)
import { useState, useEffect } from "react"
import {
  FileText,
  ImageIcon,
  Video,
  Music,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
  Grid3X3,
  List,
  Upload,
  ArrowLeft,
  Folder,
  HardDrive,
  Zap,
  Shield,
  Settings,
  Calendar,
  Book,
  Palette,
  Monitor,
  FileType,
  Database,
  Presentation,
  FileSpreadsheet,
  Code,
  FileArchive,
} from "lucide-react"

interface FilesListProps {
  folderId: string
  onUploadClick: () => void
}

// react-client/src/components/files/FilesList.tsx (updated)

interface FilesListProps {
  folderId: string
  onUploadClick: () => void
}

export function FilesList({ folderId, onUploadClick }: FilesListProps) {
  const { files, loading, error, loadFiles, deleteFile, downloadFile } = useFiles()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [hasLoadedFiles, setHasLoadedFiles] = useState(false)

  // Load files when component mounts or folder changes
  useEffect(() => {
    if (folderId && !hasLoadedFiles) {
      console.log("📄 Loading files for folder:", folderId)
      loadFiles(folderId)
      setHasLoadedFiles(true)
    }
  }, [folderId]) // רק folderId בdependencies

  // Reset when folder changes
  useEffect(() => {
    setHasLoadedFiles(false)
  }, [folderId])

  // Refresh files function
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadFiles(folderId)
      setHasLoadedFiles(true) // עדכן את המצב אחרי refresh
    } catch (err) {
      console.error("Failed to refresh files:", err)
    } finally {
      setRefreshing(false)
    }
  }

  // Get file icon based on content type
   const getFileIcon = (file: FileItem) => {
    console.log("File type:", file)
    const contentType = file.contentType || ""
    const fileName = file.name || ""
    const extension = fileName.toLowerCase().split('.').pop() || ""

    // Images
    if (contentType.startsWith("image/") ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(extension)) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />
    }

    // Videos
    if (contentType.startsWith("video/") ||
      ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'].includes(extension)) {
      return <Video className="w-6 h-6 text-purple-500" />
    }

    // Audio
    if (contentType.startsWith("audio/") ||
      ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'].includes(extension)) {
      return <Music className="w-6 h-6 text-green-500" />
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg'].includes(extension)) {
      return <FileArchive className="w-6 h-6 text-orange-500" />
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'vue', 'svelte', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bat', 'ps1'].includes(extension)) {
      return <Code className="w-6 h-6 text-indigo-500" />
    }

    // PDFs
    if (extension === 'pdf' || contentType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    }

    // Documents
    if (['doc', 'docx', 'odt', 'rtf'].includes(extension)) {
      return <FileText className="w-6 h-6 text-blue-600" />
    }

    // Spreadsheets
    if (['xls', 'xlsx', 'ods', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />
    }

    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(extension)) {
      return <Presentation className="w-6 h-6 text-orange-600" />
    }

    // Database files
    if (['db', 'sqlite', 'sqlite3', 'mdb', 'accdb'].includes(extension)) {
      return <Database className="w-6 h-6 text-purple-600" />
    }

    // Text files
    if (['txt', 'md', 'readme', 'log', 'cfg', 'conf', 'ini'].includes(extension) ||
      contentType.startsWith("text/")) {
      return <FileType className="w-6 h-6 text-gray-600" />
    }

    // Executable files
    if (['exe', 'msi', 'app', 'deb', 'rpm', 'pkg', 'run'].includes(extension)) {
      return <Monitor className="w-6 h-6 text-gray-800" />
    }

    // Design files
    if (['psd', 'ai', 'sketch', 'fig', 'xd', 'indd'].includes(extension)) {
      return <Palette className="w-6 h-6 text-pink-500" />
    }

    // Ebook files
    if (['epub', 'mobi', 'azw', 'azw3', 'fb2'].includes(extension)) {
      return <Book className="w-6 h-6 text-amber-600" />
    }

    // Calendar files
    if (['ics', 'ical', 'vcs'].includes(extension)) {
      return <Calendar className="w-6 h-6 text-blue-400" />
    }

    // Configuration files
    if (['config', 'properties', 'env', 'gitignore', 'dockerignore', 'editorconfig'].includes(extension)) {
      return <Settings className="w-6 h-6 text-gray-500" />
    }

    // Security/Certificate files
    if (['pem', 'crt', 'cer', 'der', 'p12', 'pfx', 'key', 'pub'].includes(extension)) {
      return <Shield className="w-6 h-6 text-yellow-600" />
    }

    // Power/Script files
    if (['ps1', 'psm1', 'bash', 'zsh', 'fish', 'cmd'].includes(extension)) {
      return <Zap className="w-6 h-6 text-yellow-500" />
    }

    // Disk/Image files
    if (['img', 'vhd', 'vmdk', 'qcow2'].includes(extension)) {
      return <HardDrive className="w-6 h-6 text-gray-700" />
    }

    // Default file icon
    return <FileText className="w-6 h-6 text-gray-500" />
  }


  // Handle file deletion with confirmation
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(fileId)
      await deleteFile(fileId)
      console.log("✅ File deleted successfully:", fileName)
    } catch (err) {
      console.error("❌ Failed to delete file:", err)
      // You might want to show a toast notification here
    } finally {
      setDeletingId(null)
    }
  }

  // Handle file download
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      console.log("⬇️ Starting download for:", fileName)
      await downloadFile(fileId, fileName)
      console.log("✅ Download initiated for:", fileName)
    } catch (err) {
      console.error("❌ Failed to download file:", err)
      // You might want to show a toast notification here
    }
  }

  // Loading state while fetching files
  if (loading && files.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading files from server...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Files ({files.length})  
        </CardTitle>
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-600 hover:text-gray-900"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button size="sm" onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {files.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files in this folder</h3>
            <p className="text-gray-500 mb-6">Upload your first file to get started</p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onUploadClick}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : (
          /* Files Display */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-2"
            }
          >
            {files.map((file) => (
              <div
                key={file.id}
                className={
                  viewMode === "grid"
                    ? "group relative p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                    : "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                }
              >
                {viewMode === "grid" ? (
                  // Grid View Layout
                  <>
                    <div className="flex flex-col items-center text-center">
                      {/* File Icon/Preview */}
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                        {getFileIcon(file)}
                      </div>

                      {/* File Info */}
                      <h3 className="font-medium text-gray-900 truncate w-full mb-1" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      <p className="text-xs text-gray-400">{formatDate(file.createdAt)}</p>

                      {/* Additional file info */}
                      {file.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate w-full" title={file.description}>
                          {file.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons (Grid) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file.id, file.name)}
                        className="bg-white shadow-sm hover:bg-gray-50"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="bg-white shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete file"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  // List View Layout
                  <>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* File Icon */}
                      {getFileIcon(file)}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDate(file.createdAt)}</span>
                          {file.downloadCount > 0 && (
                            <span>{file.downloadCount} downloads</span>
                          )}
                        </div>
                        {file.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">{file.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (List) */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file.id, file.name)}
                        className="hover:bg-gray-100"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete file"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for refresh */}
        {loading && files.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">Refreshing files...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
import UploadSection from "../components/dashboard/UploadSection"
import { useFiles } from "../contexts/file-context"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { formatDate, formatFileSize } from "../lib/utils"
import type { FileItem } from "../types/api"

function FilesPageContent() {
  const { folderId } = useParams<{ folderId: string }>()
  const [searchParams] = useSearchParams()
  const folderName = searchParams.get("name") || "Folder"
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)

  const handleToggleUpload = () => {
    setShowUpload(!showUpload)
  }

  const handleUploadComplete = () => {
    setShowUpload(false)
  }

  if (!folderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: Folder ID not found</p>
          <Button onClick={() => navigate("/folders")} className="mt-4">
            Back to Folders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/folders")}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Folders
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <Folder className="h-6 w-6 ml-2 text-blue-600" />
                {folderName}
              </h1>
            </div>
            <Button
              onClick={handleToggleUpload}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Folder Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Folder className="h-5 w-5 ml-2 text-blue-600" />
                Folder: {folderName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You can view and manage the files in this folder. Upload new files or manage existing files.
              </p>
            </CardContent>
          </Card>

          {/* Upload Section */}
          {showUpload && (
            <UploadSection
              currentFolderName={folderName}
              currentFolderId={folderId}
              showUpload={showUpload}
              onToggleUpload={handleToggleUpload}
              onUploadComplete={handleUploadComplete}
            />
          )}

          {/* Files List */}
          <FilesList folderId={folderId} onUploadClick={handleToggleUpload} />
        </div>
      </main>
    </div>
  )
}

export default function FilesPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && !user) {
    navigate("/login")
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return <FilesPageContent />
}