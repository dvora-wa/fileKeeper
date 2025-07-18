"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { fileApi, type UploadMethod } from "../lib/api"
import type { FileItem } from "../types/api"
import type { FileWithPreview } from "../components/upload/FileUpload"

interface FileContextType {
  files: FileItem[]
  loading: boolean
  error: string | null
  uploadProgress: Record<string, number>

  // Actions
  loadFiles: (folderId: string) => Promise<void>
  uploadFiles: (files: FileWithPreview[], folderId: string, method?: UploadMethod) => Promise<void>
  deleteFile: (fileId: string) => Promise<void>
  downloadFile: (fileId: string, fileName: string) => Promise<void>
  clearError: () => void
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Load files for a folder
  const loadFiles = async (folderId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log("📄 Loading files for folder:", folderId)

      const filesData = await fileApi.getFolderFiles(folderId)
      setFiles(filesData)

      console.log("✅ Loaded files:", filesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load files"
      setError(errorMessage)
      console.error("❌ Error loading files:", err)
    } finally {
      setLoading(false)
    }
  }

  // Upload multiple files with chosen method
  const uploadFiles = async (fileList: FileWithPreview[], folderId: string, method: UploadMethod = "direct") => {
    try {
      setError(null)
      console.log(`📤 Uploading ${fileList.length} files using ${method} method to folder:`, folderId)

      const uploadPromises = fileList.map(async (file, index) => {
        const fileId = `upload-${Date.now()}-${index}`

        try {
          // Update progress
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

          let uploadedFile: FileItem

          if (method === "direct") {
            // Direct upload through server
            const progressInterval = setInterval(() => {
              setUploadProgress((prev) => {
                const currentProgress = prev[fileId] || 0
                if (currentProgress <= 90) {
                  return { ...prev, [fileId]: currentProgress + 10 }
                }
                return prev
              })
            }, 200)

            const formData = new FormData()
            formData.append("file", file.file) // Use the actual File object
            formData.append("folderId", folderId)
            formData.append("description", "")
            formData.append("tags", "")

            uploadedFile = await fileApi.uploadFileDirect(formData)
            clearInterval(progressInterval)

          } else {
            // Presigned URL upload
            const progressInterval = setInterval(() => {
              setUploadProgress((prev) => {
                const currentProgress = prev[fileId] || 0
                if (currentProgress <= 85) {
                  return { ...prev, [fileId]: currentProgress + 15 }
                }
                return prev
              })
            }, 200)

            uploadedFile = await fileApi.uploadFilePresigned(file.file, folderId, "", "")
            clearInterval(progressInterval)
          }

          // Complete progress
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))

          // Add to files list
          setFiles((prev) => [...prev, uploadedFile])

          console.log("✅ File uploaded:", uploadedFile.name)

          // Remove from progress after delay
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev }
              delete newProgress[fileId]
              return newProgress
            })
          }, 2000)

          return uploadedFile
        } catch (err) {
          console.error("❌ Error uploading file:", file.name, err)
          setUploadProgress((prev) => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
          throw err
        }
      })

      await Promise.all(uploadPromises)
      console.log("✅ All files uploaded successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload files"
      setError(errorMessage)
      console.error("❌ Error uploading files:", err)
      throw err
    }
  }

  // Delete file
  const deleteFile = async (fileId: string) => {
    try {
      setError(null)
      console.log("🗑️ Deleting file:", fileId)

      await fileApi.deleteFile(fileId)

      // Remove from files list
      setFiles((prev) => prev.filter((file) => file.id !== fileId))

      console.log("✅ File deleted:", fileId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete file"
      setError(errorMessage)
      console.error("❌ Error deleting file:", err)
      throw err
    }
  }

  // Download file
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      setError(null)
      console.log("⬇️ Downloading file:", fileId)

      const downloadData = await fileApi.getDownloadUrl(fileId)

      const link = document.createElement("a")
      link.href = downloadData.downloadUrl
      link.download = fileName
      link.target = "_blank" // פתיחה בחלונית חדשה אם לא יורד
      link.rel = "noopener noreferrer" // אבטחה

      // הוספת headers לכפיית הורדה
      link.setAttribute('download', fileName)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("✅ File download started:", fileName)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download file"
      setError(errorMessage)
      console.error("❌ Error downloading file:", err)
      throw err
    }
  }

  const clearError = () => setError(null)

  return (
    <FileContext.Provider
      value={{
        files,
        loading,
        error,
        uploadProgress,
        loadFiles,
        uploadFiles,
        deleteFile,
        downloadFile,
        clearError,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFiles() {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider")
  }
  return context
}
