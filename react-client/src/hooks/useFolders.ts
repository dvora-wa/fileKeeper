// src/hooks/useFolders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { foldersApi } from '../services/api'
import { useFoldersStore } from '../store'
import type { CreateFolderDto } from '../types'
import { toast } from 'react-hot-toast'

export const useFolders = (parentFolderId?: string) => {
  const queryClient = useQueryClient()
  const foldersStore = useFoldersStore()

  // Get folders
  const {
    data: folders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['folders', parentFolderId],
    queryFn: () => foldersApi.getFolders(parentFolderId),
    staleTime: 60000 // 1 minute
  })

  // Get specific folder
  const useFolder = (folderId: string) => {
    return useQuery({
      queryKey: ['folder', folderId],
      queryFn: () => foldersApi.getFolder(folderId),
      enabled: !!folderId,
      staleTime: 60000
    })
  }

  // Create folder
  const createMutation = useMutation({
    mutationFn: (data: CreateFolderDto) => foldersApi.createFolder(data),
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('התיקייה נוצרה בהצלחה')
      return newFolder
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה ביצירת התיקייה')
    }
  })

  // Update folder
  const updateMutation = useMutation({
    mutationFn: ({ folderId, data }: { folderId: string; data: CreateFolderDto }) =>
      foldersApi.updateFolder(folderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('התיקייה עודכנה בהצלחה')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בעדכון התיקייה')
    }
  })

  // Delete folder
  const deleteMutation = useMutation({
    mutationFn: (folderId: string) => foldersApi.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('התיקייה נמחקה בהצלחה')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה במחיקת התיקייה')
    }
  })

  return {
    folders,
    isLoading,
    error,
    refetch,
    useFolder,
    createFolder: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateFolder: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteFolder: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    ...foldersStore
  }
}
