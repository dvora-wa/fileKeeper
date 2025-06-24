"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card"
import { Alert, AlertDescription } from "../ui/alert"
import { Loader2, FolderPlus, X, AlertCircle } from "lucide-react"
import { useFolders } from "../../contexts/folder-context"
import type { CreateFolderRequest } from "../../types/api"

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const [formData, setFormData] = useState<CreateFolderRequest>({
    name: "",
    description: "",
    color: "#3B82F6",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { createFolder, currentFolder } = useFolders()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const folderData: CreateFolderRequest = {
        ...formData,
        parentFolderId: currentFolder?.id,
      }

      await createFolder(folderData)

      // Reset form and close modal
      setFormData({ name: "", description: "", color: "#3B82F6" })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FolderPlus className="w-5 h-5 mr-2 text-blue-600" />
              Create New Folder
            </CardTitle>
            <CardDescription>
              {currentFolder ? `Create folder in "${currentFolder.name}"` : "Create folder in root directory"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Folder Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter folder name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter folder description"
                value={formData.description || ""}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Folder Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color || "#3B82F6"}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-16 h-10"
                />
                <span className="text-sm text-gray-500">{formData.color}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Folder
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
