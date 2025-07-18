"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Alert, AlertDescription } from "../ui/alert"
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
  FileArchive,
  Code,
  FileSpreadsheet,
  Presentation,
  Database,
  FileType,
  Monitor,
  Palette,
  Book,
  Calendar,
  Settings,
  Shield,
  Zap,
  HardDrive,
} from "lucide-react"
import { useFiles } from "../../contexts/file-context"
import { formatFileSize, formatDate } from "../../lib/utils"
import type { FileItem } from "../../types/api"

interface FilesListProps {
  folderId: string
  onUploadClick: () => void
}

export default function FilesList({ folderId, onUploadClick }: FilesListProps) {
  const { files, loading, error, loadFiles, deleteFile, downloadFile } = useFiles()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // const hasLoaded = useRef(false)

  // Load files when folder changes
  // useEffect(() => {
  //   if (!hasLoaded.current && folderId) {
  //     loadFiles(folderId);
  //     hasLoaded.current = true
  //   }
  // }, [])

  // Get file icon
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


  // Handle file deletion
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(fileId)
      await deleteFile(fileId)
    } catch (err) {
      console.error("Failed to delete file:", err)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle file download
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      await downloadFile(fileId, fileName)
    } catch (err) {
      console.error("Failed to download file:", err)
    }
  }

  if (loading && files.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading files...</span>
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No files yet</p>
            <p className="text-sm">Upload your first file to get started</p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={onUploadClick}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"
            }
          >
            {files.map((file) => (
              <div
                key={file.id}
                className={
                  viewMode === "grid"
                    ? "group relative p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                    : "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                }
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                        {getFileIcon(file)}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate w-full" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      <p className="text-xs text-gray-400">{formatDate(file.createdAt)}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file.id, file.name)}
                        className="bg-white shadow-sm hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="bg-white shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  // List View
                  <>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file.id, file.name)}
                        className="hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        disabled={deletingId === file.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
      </CardContent>
    </Card>
  )
}
