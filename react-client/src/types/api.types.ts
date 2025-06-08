export interface ApiError {
  error: string
  statusCode: number
  timestamp: string
}

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error' | 'cancelled'
  error?: string
}

// // src/types/ui.types.ts
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

// // src/types/common.types.ts
// export interface SelectOption {
//   value: string
//   label: string
//   icon?: string
// }

// export interface FileTypeInfo {
//   extension: string
//   mimeType: string
//   category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
//   icon: string
//   color: string
// }

// export interface SortOption {
//   field: string
//   direction: 'asc' | 'desc'
//   label: string
// }

// export interface FilterOptions {
//   fileTypes: string[]
//   dateRange: {
//     from?: Date
//     to?: Date
//   }
//   sizeRange: {
//     min?: number
//     max?: number
//   }
//   tags: string[]
// }
