// src/components/files/FileCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Download,
  Trash2,
  Share,
  Star,
  MoreVertical
} from 'lucide-react'
import { Button, Card } from '../ui'
import { cn } from '../../utils'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import type { FileItem } from '../../types'

export interface FileCardProps {
  file: FileItem
  isSelected?: boolean
  onSelect?: (fileId: string) => void
  onDownload?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  onShare?: (fileId: string) => void
  onToggleFavorite?: (fileId: string) => void
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onDownload,
  onDelete,
  onShare,
  onToggleFavorite
}) => {
  const [showActions, setShowActions] = React.useState(false)

  const getFileIcon = () => {
    if (file.isImage) return <Image size={24} className="text-blue-500" />
    if (file.isVideo) return <Video size={24} className="text-purple-500" />
    if (file.contentType.startsWith('audio/')) return <Music size={24} className="text-green-500" />
    if (file.isDocument) return <FileText size={24} className="text-red-500" />
    if (file.contentType.includes('zip') || file.contentType.includes('rar')) {
      return <Archive size={24} className="text-orange-500" />
    }
    return <FileText size={24} className="text-gray-500" />
  }

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: he 
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card
        className={cn(
          'relative group cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:border-primary/20',
          isSelected && 'ring-2 ring-primary border-primary'
        )}
        onClick={() => onSelect?.(file.id)}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
          </div>
        )}

        {/* File preview or icon */}
        <div className="p-4 pb-2">
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-3 overflow-hidden">
            {file.isImage ? (
              <img
                src={`/api/files/download/${file.id}`}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              getFileIcon()
            )}
          </div>

          {/* File info */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{file.sizeFormatted}</span>
              <span>{formatDate(file.createdAt)}</span>
            </div>

            {file.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {file.description}
              </p>
            )}

            {file.tags && (
              <div className="flex flex-wrap gap-1">
                {file.tags.split(',').slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs rounded"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDownload?.(file.id)
              }}
              title="הורד"
            >
              <Download size={14} />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onShare?.(file.id)
              }}
              title="שתף"
            >
              <Share size={14} />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              title="עוד פעולות"
            >
              <MoreVertical size={14} />
            </Button>
          </div>

          {/* More actions menu */}
          {showActions && (
            <Card className="absolute top-full left-0 mt-1 p-1 shadow-lg z-10 min-w-[120px]">
              <button
                className="w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(file.id)
                  setShowActions(false)
                }}
              >
                <Star size={14} />
                מועדפים
              </button>
              
              <button
                className="w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(file.id)
                  setShowActions(false)
                }}
              >
                <Trash2 size={14} />
                מחק
              </button>
            </Card>
          )}
        </div>

        {/* Download count */}
        {file.downloadCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs">
            {file.downloadCount} הורדות
          </div>
        )}
      </Card>
    </motion.div>
  )
}
