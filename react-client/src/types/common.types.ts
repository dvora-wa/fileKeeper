export interface SelectOption {
    value: string
    label: string
    icon?: string
  }
  
  export interface FileTypeInfo {
    extension: string
    mimeType: string
    category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
    icon: string
    color: string
  }
  
  export interface SortOption {
    field: string
    direction: 'asc' | 'desc'
    label: string
  }
  
  export interface FilterOptions {
    fileTypes: string[]
    dateRange: {
      from?: Date
      to?: Date
    }
    sizeRange: {
      min?: number
      max?: number
    }
    tags: string[]
  }
  