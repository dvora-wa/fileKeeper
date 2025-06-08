// src/hooks/useUpload.ts
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useUiStore } from '../store'
import type { DirectUploadDto, UploadProgress } from '../types'
import { useFiles } from './useFiles'

export interface UseUploadOptions {
  folderId: string
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  onUploadComplete?: (files: any[]) => void
}

export const useUpload = ({
  folderId,
  accept,
  maxSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  onUploadComplete
}: UseUploadOptions) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const { addUpload, updateUpload, removeUpload } = useUiStore()
  const { uploadFiles } = useFiles()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadData: DirectUploadDto[] = acceptedFiles.map(file => ({
      file,
      folderId,
      description: '',
      tags: ''
    }))

    // Initialize upload progress
    const initialUploads: UploadProgress[] = acceptedFiles.map(file => ({
      fileId: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }))

    setUploads(initialUploads)
    initialUploads.forEach(upload => addUpload(upload))

    try {
      await uploadFiles({
        uploads: uploadData,
        onProgress: (fileId: string, progress: number) => {
          updateUpload(fileId, { progress })
          setUploads(prev => 
            prev.map(upload => 
              upload.fileId === fileId 
                ? { ...upload, progress }
                : upload
            )
          )
        }
      })

      // Mark all as completed
      initialUploads.forEach(upload => {
        updateUpload(upload.fileId, { status: 'completed', progress: 100 })
        setTimeout(() => removeUpload(upload.fileId), 3000)
      })

      setUploads([])
      onUploadComplete?.(acceptedFiles)
    } catch (error) {
      // Mark all as error
      initialUploads.forEach(upload => {
        updateUpload(upload.fileId, { 
          status: 'error', 
          error: 'שגיאה בהעלאה' 
        })
      })
    }
  }, [folderId, uploadFiles, addUpload, updateUpload, removeUpload, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple: true
  })

  return {
    uploads,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isUploading: uploads.some(upload => upload.status === 'uploading')
  }
}
