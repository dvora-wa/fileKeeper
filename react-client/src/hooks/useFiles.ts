import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '../services/api'
import { useFilesStore } from '../store'
import type { SearchFilesDto, DirectUploadDto } from '../types'
import { toast } from 'react-hot-toast'

export const useFiles = (folderId?: string) => {
  const queryClient = useQueryClient()
  const filesStore = useFilesStore()

  // Get folder files
  const {
    data: files,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['files', folderId],
    queryFn: () => folderId ? filesApi.getFolderFiles(folderId) : Promise.resolve([]),
    enabled: !!folderId,
    staleTime: 30000 // 30 seconds
  })

  // Search files
  const searchMutation = useMutation({
    mutationFn: (params: SearchFilesDto) => filesApi.searchFiles(params),
    onSuccess: (data) => {
      filesStore.searchResults = data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בחיפוש קבצים')
    }
  })

  // Upload files
  const uploadMutation = useMutation({
    mutationFn: async ({ uploads, onProgress }: {
      uploads: DirectUploadDto[]
      onProgress?: (fileId: string, progress: number) => void
    }) => {
      const uploadPromises = uploads.map(async (upload) => {
        const fileId = crypto.randomUUID()
        
        return filesApi.directUpload(upload, (progress) => {
          onProgress?.(fileId, progress)
        })
      })

      return Promise.all(uploadPromises)
    },
    onSuccess: (uploadedFiles) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success(`${uploadedFiles.length} קבצים הועלו בהצלחה`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בהעלאת קבצים')
    }
  })

  // Delete file
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      toast.success('הקובץ נמחק בהצלחה')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה במחיקת הקובץ')
    }
  })

  // Download file
  const downloadMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const downloadData = await filesApi.getDownloadUrl(fileId)
      
      // Create download link
      const link = document.createElement('a')
      link.href = downloadData.downloadUrl
      link.download = downloadData.fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return downloadData
    },
    onSuccess: () => {
      toast.success('הקובץ ירד בהצלחה')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'שגיאה בהורדת הקובץ')
    }
  })

  return {
    files,
    isLoading,
    error,
    refetch,
    searchFiles: searchMutation.mutate,
    isSearching: searchMutation.isPending,
    uploadFiles: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    downloadFile: downloadMutation.mutate,
    isDownloading: downloadMutation.isPending,
    ...filesStore
  }
}