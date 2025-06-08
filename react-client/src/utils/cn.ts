// import { create } from 'zustand'
// import type { Folder } from '../types/folder.types'
// // import { Folder } from '@/types'

// interface FoldersState {
//   folders: Folder[]
//   setFolders: (folders: Folder[]) => void
// }

// export const useFoldersStore = create<FoldersState>((set) => ({
//   folders: [],
//   setFolders: (folders) => set({ folders })
// }))

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * פונקציה לשילוב classes של Tailwind CSS באופן אינטליגנטי
 * משתמשת ב-clsx לעיבוד תנאי ו-twMerge למניעת קונפליקטים
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export של כל העזרים
export * from './constants'
export * from './formatters'
export * from './fileUtils'
export * from './validators'