import React from 'react'
import { motion } from 'framer-motion'
import { FileCard } from './FileCard'
import type { FileItem } from '../../types'
import { LoadingSpinner } from '../ui'

export interface FileListProps {
  files: FileItem[]
  loading?: boolean
  selectedFiles?: string[]
  onSelectFile?: (fileId: string) => void
  onDownload?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  onShare?: (fileId: string) => void
  onToggleFavorite?: (fileId: string) => void
}

export const FileList: React.FC<FileListProps> = ({
  files,
  loading,
  selectedFiles = [],
  onSelectFile,
  onDownload,
  onDelete,
  onShare,
  onToggleFavorite
}) => {
  if (loading) {
    return <LoadingSpinner size="lg" text="טוען קבצים..." />
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">לא נמצאו קבצים</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onSelect={onSelectFile}
          onDownload={onDownload}
          onDelete={onDelete}
          onShare={onShare}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}