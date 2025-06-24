"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { folderApi } from "../lib/api"
import type { Folder, CreateFolderRequest } from "../types/api"

interface FolderContextType {
  folders: Folder[]
  currentFolder: Folder | null
  loading: boolean
  error: string | null
  breadcrumb: Folder[]

  // Actions
  loadFolders: (parentFolderId?: string) => Promise<void>
  createFolder: (data: CreateFolderRequest) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  navigateToFolder: (folder: Folder | null) => void
  refreshFolders: () => Promise<void>
}

const FolderContext = createContext<FolderContextType | undefined>(undefined)

export function FolderProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([])

  // Load folders for current directory
  const loadFolders = async (parentFolderId?: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log("📁 Loading folders for parent:", parentFolderId || "root")

      const foldersData = await folderApi.getFolders(parentFolderId)
      setFolders(foldersData)

      console.log("✅ Loaded folders:", foldersData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load folders"
      setError(errorMessage)
      console.error("❌ Error loading folders:", err)

      // Show user-friendly error for AWS issues
      if (errorMessage.includes("AWS") || errorMessage.includes("S3")) {
        setError("AWS S3 is not configured. Please check server configuration or use mock mode for development.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Create new folder
  const createFolder = async (data: CreateFolderRequest) => {
    try {
      setError(null)
      console.log("📁 Creating folder:", data)

      const newFolder = await folderApi.createFolder(data)

      // Add to current folders list
      setFolders((prev) => [...prev, newFolder])

      console.log("✅ Folder created:", newFolder)
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "Failed to create folder"

      // Handle AWS configuration errors
      if (errorMessage.includes("AWS") || errorMessage.includes("S3")) {
        errorMessage = "AWS S3 configuration missing. Please configure AWS credentials in your server settings."
      }

      setError(errorMessage)
      console.error("❌ Error creating folder:", err)
      throw new Error(errorMessage)
    }
  }

  // Delete folder
  const deleteFolder = async (folderId: string) => {
    try {
      setError(null)
      console.log("🗑️ Deleting folder:", folderId)

      await folderApi.deleteFolder(folderId)

      // Remove from folders list
      setFolders((prev) => prev.filter((folder) => folder.id !== folderId))

      console.log("✅ Folder deleted:", folderId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete folder"
      setError(errorMessage)
      console.error("❌ Error deleting folder:", err)
      throw err
    }
  }

  // Navigate to folder and update breadcrumb
  const navigateToFolder = (folder: Folder | null) => {
    setCurrentFolder(folder)

    if (folder) {
      // Build breadcrumb path
      const newBreadcrumb = buildBreadcrumb(folder)
      setBreadcrumb(newBreadcrumb)

      // Load folders in this directory
      loadFolders(folder.id)
    } else {
      // Navigate to root
      setBreadcrumb([])
      loadFolders()
    }
  }

  // Build breadcrumb path (simplified - in real app you'd need parent info)
  const buildBreadcrumb = (folder: Folder): Folder[] => {
    // For now, just return the current folder
    // In a real implementation, you'd traverse up the parent chain
    return [folder]
  }

  // Refresh current folder
  const refreshFolders = async () => {
    await loadFolders(currentFolder?.id)
  }

  // Load root folders on mount
  useEffect(() => {
    loadFolders()
  }, [])

  return (
    <FolderContext.Provider
      value={{
        folders,
        currentFolder,
        loading,
        error,
        breadcrumb,
        loadFolders,
        createFolder,
        deleteFolder,
        navigateToFolder,
        refreshFolders,
      }}
    >
      {children}
    </FolderContext.Provider>
  )
}

export function useFolders() {
  const context = useContext(FolderContext)
  if (context === undefined) {
    throw new Error("useFolders must be used within a FolderProvider")
  }
  return context
}
