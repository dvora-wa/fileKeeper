import React from 'react'
import { motion } from 'framer-motion'
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react'
import { useUpload } from '../../hooks'
import { Button, Card } from '../ui'
import { cn } from '../../utils'

export interface FileUploadProps {
  folderId: string
  onUploadComplete?: (files: any[]) => void
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  folderId,
  onUploadComplete,
  className
}) => {
  const {
    uploads,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isUploading
  } = useUpload({
    folderId,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.flac'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/*': ['.txt', '.csv'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    onUploadComplete
  })

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden cursor-pointer transition-all duration-200',
          'border-2 border-dashed p-8',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'hover:border-primary/50 hover:bg-accent/50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            {isDragReject ? (
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            )}
          </motion.div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'שחרר כאן לטעינה' : 'העלה קבצים'}
          </h3>
          
          <p className="text-muted-foreground mb-4 max-w-sm">
            {isDragReject
              ? 'סוג קובץ לא נתמך'
              : 'גרור קבצים לכאן או לחץ לבחירה. עד 100MB לקובץ'}
          </p>

          <Button variant="outline" disabled={isUploading}>
            בחר קבצים
          </Button>
        </div>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload) => (
            <Card key={upload.fileId} className="p-4">
              <div className="flex items-center gap-3">
                <FileIcon size={20} className="text-muted-foreground" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {upload.fileName}
                  </p>
                  
                  <div className="mt-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className={cn(
                          'h-2 rounded-full transition-colors',
                          upload.status === 'completed' && 'bg-green-500',
                          upload.status === 'error' && 'bg-destructive',
                          upload.status === 'uploading' && 'bg-primary'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${upload.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{upload.progress}%</span>
                      <span className={cn(
                        upload.status === 'completed' && 'text-green-600',
                        upload.status === 'error' && 'text-destructive'
                      )}>
                        {upload.status === 'completed' && 'הושלם'}
                        {upload.status === 'error' && upload.error}
                        {upload.status === 'uploading' && 'מעלה...'}
                      </span>
                    </div>
                  </div>
                </div>

                {upload.status === 'error' && (
                  <Button variant="ghost" size="icon">
                    <X size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}