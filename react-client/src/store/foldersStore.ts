import { create } from 'zustand'
import type { Folder } from '../types'
// import { Folder } from '@/types'

interface FoldersState {
  folders: Folder[]
  currentFolder: Folder | null
  breadcrumbs: Folder[]
  isLoading: boolean
  setFolders: (folders: Folder[]) => void
  setCurrentFolder: (folder: Folder | null) => void
  setBreadcrumbs: (breadcrumbs: Folder[]) => void
  setLoading: (loading: boolean) => void
  addFolder: (folder: Folder) => void
  updateFolder: (folderId: string, updates: Partial<Folder>) => void
  removeFolder: (folderId: string) => void
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  currentFolder: null,
  breadcrumbs: [],
  isLoading: false,

  setFolders: (folders) => set({ folders }),
  
  setCurrentFolder: (currentFolder) => set({ currentFolder }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  addFolder: (folder) => {
    const { folders } = get()
    set({ folders: [...folders, folder] })
  },
  
  updateFolder: (folderId, updates) => {
    const { folders } = get()
    set({ 
      folders: folders.map(folder => 
        folder.id === folderId ? { ...folder, ...updates } : folder
      )
    })
  },
  
  removeFolder: (folderId) => {
    const { folders } = get()
    set({ 
      folders: folders.filter(folder => folder.id !== folderId)
    })
  }
}))