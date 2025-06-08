export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
  
  export const formatDateRelative = (date: string | Date): string => {
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
    if (diffInSeconds < 60) return 'עכשיו'
    if (diffInSeconds < 3600) return `לפני ${Math.floor(diffInSeconds / 60)} דקות`
    if (diffInSeconds < 86400) return `לפני ${Math.floor(diffInSeconds / 3600)} שעות`
    if (diffInSeconds < 604800) return `לפני ${Math.floor(diffInSeconds / 86400)} ימים`
    
    return formatDate(date)
  }
  