export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  VIDEO: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  TEXT: ['txt', 'csv', 'md', 'json', 'xml'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz']
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_FILES_PER_UPLOAD = 10

export const STORAGE_KEYS = {
  TOKEN: 'filekeeper_token',
  REFRESH_TOKEN: 'filekeeper_refresh_token',
  USER: 'filekeeper_user',
  THEME: 'filekeeper_theme'
}