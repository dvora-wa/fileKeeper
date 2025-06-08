import { create } from 'zustand'
import type { FileItem, PaginatedResult } from '../types'
// import { FileItem, PaginatedResult } from '@/types'

interface FilesState {
  files: FileItem[]
  searchResults: PaginatedResult<FileItem> | null
  selectedFiles: string[]
  isLoading: boolean
  setFiles: (files: FileItem[]) => void
  setSearchResults: (results: PaginatedResult<FileItem>) => void
  setSelectedFiles: (fileIds: string[]) => void
  toggleFileSelection: (fileId: string) => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  searchResults: null,
  selectedFiles: [],
  isLoading: false,

  setFiles: (files) => set({ files }),
  
  setSearchResults: (searchResults) => set({ searchResults }),
  
  setSelectedFiles: (selectedFiles) => set({ selectedFiles }),
  
  toggleFileSelection: (fileId) => {
    const { selectedFiles } = get()
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter(id => id !== fileId)
      : [...selectedFiles, fileId]
    set({ selectedFiles: newSelection })
  },
  
  clearSelection: () => set({ selectedFiles: [] }),
  
  setLoading: (isLoading) => set({ isLoading })
}))