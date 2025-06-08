import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Filter, X } from 'lucide-react'
import { Button, Input, Card, Modal } from '../ui'
import type { SearchFilesDto } from '../../types'
import { useDebounce } from '../../hooks'

const searchSchema = z.object({
  searchTerm: z.string().optional(),
  contentType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['name', 'size', 'contentType', 'createdAt']).optional(),
  sortDescending: z.boolean().optional()
})

type SearchFormData = z.infer<typeof searchSchema>

export interface FileSearchProps {
  onSearch: (params: SearchFilesDto) => void
  isSearching?: boolean
}

export const FileSearch: React.FC<FileSearchProps> = ({ onSearch, isSearching }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [quickSearch, setQuickSearch] = React.useState('')
  
  const debouncedSearch = useDebounce(quickSearch, 300)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema)
  })

  // Quick search effect
  React.useEffect(() => {
    if (debouncedSearch) {
      onSearch({ searchTerm: debouncedSearch })
    }
  }, [debouncedSearch, onSearch])

  const onAdvancedSearch = (data: SearchFormData) => {
    const searchParams: SearchFilesDto = {
      ...data,
      fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
      toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined
    }
    
    onSearch(searchParams)
    setShowAdvanced(false)
  }

  const clearSearch = () => {
    setQuickSearch('')
    reset()
    onSearch({})
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="חפש קבצים..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="pr-10"
            disabled={isSearching}
          />
        </div>
        
        <Button
          variant="outline"
          leftIcon={<Filter size={16} />}
          onClick={() => setShowAdvanced(true)}
        >
          חיפוש מתקדם
        </Button>
        
        {(quickSearch || debouncedSearch) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Advanced Search Modal */}
      <Modal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        title="חיפוש מתקדם"
        size="md"
      >
        <form onSubmit={handleSubmit(onAdvancedSearch)} className="space-y-4">
          <Input
            {...register('searchTerm')}
            label="מונח חיפוש"
            placeholder="הכנס מילות מפתח..."
            error={errors.searchTerm?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">סוג קובץ</label>
              <select
                {...register('contentType')}
                className="w-full h-10 px-3 border border-input rounded-md bg-background"
              >
                <option value="">כל הסוגים</option>
                <option value="image/">תמונות</option>
                <option value="video/">וידאו</option>
                <option value="audio/">שמע</option>
                <option value="application/pdf">PDF</option>
                <option value="application/msword">מסמכי Word</option>
                <option value="text/">קבצי טקסט</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">מיון לפי</label>
              <select
                {...register('sortBy')}
                className="w-full h-10 px-3 border border-input rounded-md bg-background"
              >
                <option value="createdAt">תאריך יצירה</option>
                <option value="name">שם</option>
                <option value="size">גודל</option>
                <option value="contentType">סוג קובץ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('fromDate')}
              type="date"
              label="מתאריך"
              error={errors.fromDate?.message}
            />

            <Input
              {...register('toDate')}
              type="date"
              label="עד תאריך"
              error={errors.toDate?.message}
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('sortDescending')}
              type="checkbox"
              id="sortDescending"
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="sortDescending" className="mr-2 text-sm">
              מיון יורד
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" loading={isSearching}>
              חפש
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAdvanced(false)}>
              ביטול
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}