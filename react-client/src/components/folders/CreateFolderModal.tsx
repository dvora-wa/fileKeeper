import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder, Palette } from 'lucide-react'
import { Modal, Input, Button } from '../ui'
import { useFolders } from '../../hooks'
import type { CreateFolderDto } from '../../types'

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'שם תיקייה הוא שדה חובה')
    .max(255, 'שם תיקייה ארוך מדי')
    .regex(/^[^<>:"\/\\|?*]+$/, 'שם תיקייה מכיל תווים לא חוקיים'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'צבע חייב להיות בפורמט hex').optional()
})

type CreateFolderFormData = z.infer<typeof createFolderSchema>

const FOLDER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
]

export interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  parentFolderId?: string
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  parentFolderId
}) => {
  const { createFolder, isCreating } = useFolders()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateFolderFormData>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      color: FOLDER_COLORS[0]
    }
  })

  const selectedColor = watch('color')

  const onSubmit = async (data: CreateFolderFormData) => {
    try {
      const folderData: CreateFolderDto = {
        ...data,
        parentFolderId
      }
      
      await createFolder(folderData)
      reset()
      onClose()
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="צור תיקייה חדשה"
      description="בחר שם וצבע לתיקייה החדשה"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('name')}
          label="שם התיקייה"
          placeholder="הכנס שם לתיקייה"
          leftIcon={<Folder size={16} />}
          error={errors.name?.message}
          autoFocus
        />

        <Input
          {...register('description')}
          label="תיאור (אופציונלי)"
          placeholder="הכנס תיאור קצר לתיקייה"
          error={errors.description?.message}
        />

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Palette size={16} className="inline mr-2" />
            צבע התיקייה
          </label>
          
          <div className="grid grid-cols-5 gap-3">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  selectedColor === color
                    ? 'border-primary scale-110 shadow-lg'
                    : 'border-transparent hover:border-muted-foreground hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          {errors.color && (
            <p className="text-xs text-destructive mt-1">{errors.color.message}</p>
          )}
        </div>

        {/* Preview */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: selectedColor + '20' }}
            >
              <Folder size={24} style={{ color: selectedColor }} />
            </div>
            
            <div>
              <p className="font-medium">
                {watch('name') || 'שם התיקייה'}
              </p>
              {watch('description') && (
                <p className="text-sm text-muted-foreground">
                  {watch('description')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            loading={isCreating}
            disabled={isCreating}
            className="flex-1"
          >
            צור תיקייה
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  )
}
