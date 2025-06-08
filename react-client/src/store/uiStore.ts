import { create } from 'zustand'
import type { UploadProgress } from '../types'

interface UiState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  uploads: UploadProgress[]
  toggleSidebar: () => void
  toggleTheme: () => void
  addUpload: (upload: UploadProgress) => void
  updateUpload: (fileId: string, updates: Partial<UploadProgress>) => void
  removeUpload: (fileId: string) => void
  clearAllUploads: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  theme: 'system',
  uploads: [],

  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),

  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light'
  })),

  addUpload: (upload) => {
    const { uploads } = get()
    set({ uploads: [...uploads, upload] })
  },

  updateUpload: (fileId, updates) => {
    const { uploads } = get()
    set({
      uploads: uploads.map(upload =>
        upload.fileId === fileId ? { ...upload, ...updates } : upload
      )
    })
  },

  removeUpload: (fileId) => {
    const { uploads } = get()
    set({
      uploads: uploads.filter(upload => upload.fileId !== fileId)
    })
  },

  clearAllUploads: () => set({ uploads: [] })
}))