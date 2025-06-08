import type { UploadProgress } from "./api.types"

export interface ToastMessage {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
    duration?: number
  }
  
  export interface UiStore {
    theme: 'light' | 'dark' | 'system'
    sidebarCollapsed: boolean
    uploads: UploadProgress[]
    toggleTheme: () => void
    toggleSidebar: () => void
    addUpload: (upload: UploadProgress) => void
    updateUpload: (fileId: string, updates: Partial<UploadProgress>) => void
    removeUpload: (fileId: string) => void
  }
  
  export interface BreadcrumbItem {
    id: string
    name: string
    path: string
    isFolder: boolean
  }

//   // src/types/ui.types.ts
// export interface ToastMessage {
//   id: string
//   type: 'success' | 'error' | 'warning' | 'info'
//   title: string
//   description?: string
//   duration?: number
// }

// export interface UiStore {
//   theme: 'light' | 'dark' | 'system'
//   sidebarCollapsed: boolean
//   uploads: UploadProgress[]
//   toggleTheme: () => void
//   toggleSidebar: () => void
//   addUpload: (upload: UploadProgress) => void
//   updateUpload: (fileId: string, updates: Partial<UploadProgress>) => void
//   removeUpload: (fileId: string) => void
// }

// export interface BreadcrumbItem {
//   id: string
//   name: string
//   path: string
//   isFolder: boolean
// }