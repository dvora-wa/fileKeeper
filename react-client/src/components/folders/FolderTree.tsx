import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Plus
} from 'lucide-react'
import type { Folder as FolderType } from '../../types'
import { Button } from '../ui'
import { cn } from '../../utils'

export interface FolderTreeProps {
  folders: FolderType[]
  onCreateFolder?: (parentId?: string) => void
  className?: string
}

interface FolderTreeItemProps {
  folder: FolderType
  level: number
  isExpanded: boolean
  isActive: boolean
  hasChildren: boolean
  onToggle: () => void
  onCreateFolder?: (parentId: string) => void
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  level,
  isExpanded,
  isActive,
  hasChildren,
  onToggle,
  onCreateFolder
}) => {
  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent transition-colors group',
          isActive && 'bg-accent',
          level > 0 && 'ml-4'
        )}
        style={{ marginLeft: level * 16 }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={onToggle}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <div className="w-4" />
          )}
        </Button>

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {isExpanded ? (
            <FolderOpen size={16} style={{ color: folder.color }} />
          ) : (
            <Folder size={16} style={{ color: folder.color }} />
          )}
        </div>

        {/* Folder Name */}
        <Link
          to={`/folders/${folder.id}`}
          className="flex-1 text-sm truncate hover:text-foreground"
        >
          {folder.name}
        </Link>

        {/* Add Subfolder Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            onCreateFolder?.(folder.id)
          }}
          title="צור תת-תיקייה"
        >
          <Plus size={12} />
        </Button>
      </div>
    </div>
  )
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  onCreateFolder,
  className
}) => {
  const location = useLocation()
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set())

  // Build folder hierarchy
  const buildFolderTree = (folders: FolderType[]): FolderType[] => {
    const folderMap = new Map<string, FolderType & { children: FolderType[] }>()
    const rootFolders: (FolderType & { children: FolderType[] })[] = []

    // Initialize all folders
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build the tree
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!
      
      if (folder.parentFolderId) {
        const parent = folderMap.get(folder.parentFolderId)
        if (parent) {
          parent.children.push(folderWithChildren)
        }
      } else {
        rootFolders.push(folderWithChildren)
      }
    })

    return rootFolders
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const renderFolder = (folder: FolderType & { children: FolderType[] }, level = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = location.pathname === `/folders/${folder.id}`
    const hasChildren = folder.children.length > 0

    return (
      <div key={folder.id}>
        <FolderTreeItem
          folder={folder}
          level={level}
          isExpanded={isExpanded}
          isActive={isActive}
          hasChildren={hasChildren}
          onToggle={() => toggleFolder(folder.id)}
          onCreateFolder={onCreateFolder}
        />
        
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {folder.children.map(child => renderFolder(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const folderTree = buildFolderTree(folders)

  return (
    <div className={cn('space-y-1', className)}>
      {folderTree.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Folder size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">אין תיקיות</p>
          {onCreateFolder && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => onCreateFolder()}
            >
              צור תיקייה ראשונה
            </Button>
          )}
        </div>
      ) : (
        <>
          {folderTree.map(folder => renderFolder(folder))}
          
          {onCreateFolder && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onCreateFolder()}
              leftIcon={<Plus size={16} />}
            >
              צור תיקייה חדשה
            </Button>
          )}
        </>
      )}
    </div>
  )
}