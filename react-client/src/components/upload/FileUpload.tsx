"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Alert, AlertDescription } from "../ui/alert"
import { Upload, X, FileText, ImageIcon, Video, Music, AlertCircle, Zap, Cloud, Info } from "lucide-react"
import { useFiles } from "../../contexts/file-context"
import { formatFileSize } from "../../lib/utils"
import type { UploadMethod } from "../../lib/api"

interface FileUploadProps {
  folderId: string
  onUploadComplete?: () => void
}

interface FileWithPreview extends File {
  id: string
  preview?: string
}

export default function FileUpload({ folderId, onUploadComplete }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("direct")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFiles, error, uploadProgress, clearError } = useFiles()

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files).map((file) => ({
        ...file,
        id: `${Date.now()}-${Math.random()}`,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }))

      setSelectedFiles((prev) => [...prev, ...fileArray])
      clearError()
    },
    [clearError],
  )

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  // File input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  // Remove file from selection
  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== fileId)
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find((file) => file.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  // Upload files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)
      await uploadFiles(selectedFiles, folderId, uploadMethod)

      // Clear selected files
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setSelectedFiles([])

      onUploadComplete?.()
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
    }
  }

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-blue-500" />
    if (file.type.startsWith("video/")) return <Video className="w-8 h-8 text-purple-500" />
    if (file.type.startsWith("audio/")) return <Music className="w-8 h-8 text-green-500" />
    return <FileText className="w-8 h-8 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      {/* Upload Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            בחר שיטת העלאה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Upload */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                uploadMethod === "direct" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setUploadMethod("direct")}
            >
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 text-orange-500 mr-2" />
                <h3 className="font-medium">העלאה מהירה</h3>
                {uploadMethod === "direct" && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">העלאה דרך השרת שלנו</p>
              <div className="text-xs text-gray-500">
                ✅ מהירה יותר לקבצים קטנים
                <br />✅ פשוטה יותר
                <br />
                ⚠️ מוגבלת בגודל קובץ
              </div>
            </div>

            {/* Presigned Upload */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                uploadMethod === "presigned" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setUploadMethod("presigned")}
            >
              <div className="flex items-center mb-2">
                <Cloud className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium">העלאה ישירה</h3>
                {uploadMethod === "presigned" && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">העלאה ישירה לאחסון בענן</p>
              <div className="text-xs text-gray-500">
                ✅ טובה יותר לקבצים גדולים
                <br />✅ חוסכת ברוחב פס של השרת
                <br />
                ⚠️ תהליך מורכב יותר
              </div>
            </div>
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {uploadMethod === "direct"
                ? "העלאה מהירה: הקבצים יועלו דרך השרת שלנו. מומלץ לקבצים עד 10MB."
                : "העלאה ישירה: הקבצים יועלו ישירות לאחסון בענן. מומלץ לקבצים גדולים."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Upload className={`w-12 h-12 mb-4 ${dragActive ? "text-blue-500" : "text-gray-400"}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? "שחרר את הקבצים כאן" : "העלאת קבצים"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">גרור ושחרר קבצים כאן, או לחץ לבחירת קבצים</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            בחר קבצים
          </Button>
          <input ref={fileInputRef} type="file" multiple onChange={handleInputChange} className="hidden" accept="*/*" />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">קבצים נבחרים ({selectedFiles.length})</h4>
              <Button onClick={handleUpload} disabled={uploading} className="bg-green-600 hover:bg-green-700">
                {uploading ? "מעלה..." : "העלה הכל"}
              </Button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={uploading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">התקדמות העלאה</h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>מעלה...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
