import { FILE_TYPES, MAX_FILE_SIZE } from "./constants"

export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }
  
  export const getFileType = (filename: string): string => {
    const extension = getFileExtension(filename)
    
    if (FILE_TYPES.IMAGE.includes(extension)) return 'image'
    if (FILE_TYPES.VIDEO.includes(extension)) return 'video'
    if (FILE_TYPES.AUDIO.includes(extension)) return 'audio'
    if (FILE_TYPES.DOCUMENT.includes(extension)) return 'document'
    if (FILE_TYPES.TEXT.includes(extension)) return 'text'
    if (FILE_TYPES.ARCHIVE.includes(extension)) return 'archive'
    
    return 'other'
  }
  
  export const isImageFile = (filename: string): boolean => {
    return getFileType(filename) === 'image'
  }
  
  export const isVideoFile = (filename: string): boolean => {
    return getFileType(filename) === 'video'
  }
  
  export const validateFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
    return file.size <= maxSize
  }
  
  export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    const extension = getFileExtension(file.name)
    return allowedTypes.includes(extension)
  }
  