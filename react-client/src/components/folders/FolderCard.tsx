import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Folder, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FolderOpen,
  FileText
} from 'lucide-react'
import  type { Folder as FolderType } from '../../types'
import { Button, Card } from '../ui'
import { cn } from '../../utils'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

export interface FolderCardProps {
  folder: FolderType
  onEdit?: (folder: FolderType) => void
  onDelete?: (folderId: string) => void
  className?: string
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  className
}) => {
  const [showActions, setShowActions] = React.useState(false)

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
      className={className}
    >
      <Card className="relative group cursor-pointer transition-all duration-200 hover:shadow-md">
        <Link to={`/folders/${folder.id}`} className="block p-4">
          {/* Folder Icon */}
          <div className="flex flex-col items-center text-center">
            <div 
              className="p-4 rounded-lg mb-3"
              style={{ backgroundColor: folder.color + '20' }}
            >
              <Folder 
                size={48} 
                style={{ color: folder.color }}
                className="mx-auto"
              />
            </div>

            {/* Folder Info */}
            <div className="w-full">
              <h3 className="font-medium text-sm truncate mb-1" title={folder.name}>
                {folder.name}
              </h3>
              
              {folder.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {folder.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {folder.fileCount || 0} קבצים
                </span>
                <span>{formatDate(folder.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Actions Menu */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowActions(!showActions)
              }}
            >
              <MoreVertical size={14} />
            </Button>

            {showActions && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                
                {/* Menu */}
                <Card className="absolute top-full left-0 mt-1 p-1 shadow-lg z-20 min-w-[120px]">
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onEdit?.(folder)
                      setShowActions(false)
                    }}
                  >
                    <Edit size={14} />
                    ערוך
                  </button>
                  
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-accent rounded text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDelete?.(folder.id)
                      setShowActions(false)
                    }}
                  >
                    <Trash2 size={14} />
                    מחק
                  </button>
                </Card>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}