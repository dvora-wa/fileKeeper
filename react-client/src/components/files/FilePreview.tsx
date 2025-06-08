import React from 'react'
import { X, Download, Share, Eye, FileText, Image as ImageIcon, Video, Music } from 'lucide-react'
import type { FileItem } from '../../types'
import { Button, Modal, Card } from '../ui'
import { cn } from '../../utils'

export interface FilePreviewProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (fileId: string) => void
  onShare?: (fileId: string) => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare
}) => {
  if (!file) return null

  const renderPreview = () => {
    // Image preview
    if (file.isImage) {
      return (
        <div className="flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
          <img
            src={`/api/files/download/${file.id}`}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
            loading="lazy"
          />
        </div>
      )
    }

    // Video preview
    if (file.isVideo) {
      return (
        <div className="flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
          <video
            controls
            className="max-w-full max-h-[60vh]"
            preload="metadata"
          >
            <source src={`/api/files/download/${file.id}`} type={file.contentType} />
            הדפדפן שלך לא תומך בהצגת וידאו
          </video>
        </div>
      )
    }

    // Audio preview
    if (file.contentType.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
          <Music size={64} className="text-muted-foreground mb-4" />
          <audio controls className="w-full max-w-md">
            <source src={`/api/files/download/${file.id}`} type={file.contentType} />
            הדפדפן שלך לא תומך בהשמעת אודיו
          </audio>
        </div>
      )
    }

    // PDF preview
    if (file.contentType === 'application/pdf') {
      return (
        <div className="bg-muted/50 rounded-lg overflow-hidden">
          <iframe
            src={`/api/files/download/${file.id}`}
            className="w-full h-[60vh]"
            title={file.name}
          />
        </div>
      )
    }

    // Text file preview
    if (file.contentType.startsWith('text/') || file.isDocument) {
      return (
        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
          <FileText size={64} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            תצוגה מקדימה לא זמינה לסוג קובץ זה
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => onDownload?.(file.id)}
            leftIcon={<Download size={16} />}
          >
            הורד לצפייה
          </Button>
        </div>
      )
    }

    // Default preview for unknown file types
    return (
      <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-8">
        <FileText size={64} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          תצוגה מקדימה לא זמינה לסוג קובץ זה
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => onDownload?.(file.id)}
          leftIcon={<Download size={16} />}
        >
          הורד קובץ
        </Button>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate" title={file.name}>
              {file.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{file.sizeFormatted}</span>
              <span>{file.contentType}</span>
              {file.downloadCount > 0 && (
                <span>{file.downloadCount} הורדות</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(file.id)}
              leftIcon={<Download size={16} />}
            >
              הורד
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare?.(file.id)}
              leftIcon={<Share size={16} />}
            >
              שתף
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="min-h-[300px]">
          {renderPreview()}
        </div>

        {/* File Details */}
        {(file.description || file.tags) && (
          <Card className="p-4">
            <div className="space-y-3">
              {file.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">תיאור</h4>
                  <p className="text-sm text-muted-foreground">{file.description}</p>
                </div>
              )}
              
              {file.tags && (
                <div>
                  <h4 className="text-sm font-medium mb-2">תגיות</h4>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  )
}