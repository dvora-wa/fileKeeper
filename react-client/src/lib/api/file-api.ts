import { BaseApiClient } from "./base-client"
import type {
  FileUploadUrlResponse,
  FileItem,
  FileDownloadUrlResponse,
  SearchFilesRequest,
  PaginatedResult,
} from "../../types/api"

export type UploadMethod = "direct" | "presigned"

export class FileApi extends BaseApiClient {
  // 📤 שיטה 1: העלאה ישירה דרך השרת (מהירה יותר לקבצים קטנים)
  async uploadFileDirect(formData: FormData): Promise<FileItem> {
    console.log("📤 Direct Upload: Uploading file through server")
    return this.requestFile<FileItem>("/files/direct-upload", formData)
  }

  // 📤 שיטה 2: העלאה עם Presigned URL (טובה יותר לקבצים גדולים)
  async uploadFilePresigned(file: File, folderId: string, description?: string, tags?: string): Promise<FileItem> {
    console.log("📤 Presigned Upload: Getting upload URL")

    // שלב 1: קבל Presigned URL
    const uploadData = await this.getUploadUrl(file.name, folderId)

    // שלב 2: העלה ישירות לS3
    console.log("📤 Uploading directly to S3...")
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error(`S3 Upload failed: ${uploadResponse.status}`)
    }

    console.log("✅ File uploaded to S3 successfully")

    // שלב 3: עדכן את השרת שהקובץ הועלה
    return this.request<FileItem>("/files/confirm-upload", {
      method: "POST",
      body: JSON.stringify({
        fileId: uploadData.fileId,
        description: description || "",
        tags: tags || "",
      }),
    })
  }

  // קבל Presigned URL להעלאה
  async getUploadUrl(fileName: string, folderId: string): Promise<FileUploadUrlResponse> {
    return this.request<FileUploadUrlResponse>("/files/upload-url", {
      method: "POST",
      body: JSON.stringify({ fileName, folderId }),
    })
  }

  // קבל קבצים בתיקייה
  async getFolderFiles(folderId: string): Promise<FileItem[]> {
    return this.request<FileItem[]>(`/files/folder/${folderId}`)
  }

  // קבל קישור הורדה
  async getDownloadUrl(fileId: string): Promise<FileDownloadUrlResponse> {
    return this.request<FileDownloadUrlResponse>(`/files/download/${fileId}`)
  }

  // מחק קובץ
  async deleteFile(fileId: string): Promise<void> {
    return this.request(`/files/${fileId}`, {
      method: "DELETE",
    })
  }

  // חפש קבצים
  async searchFiles(params: SearchFilesRequest): Promise<PaginatedResult<FileItem>> {
    const searchParams = new URLSearchParams()

    if (params.searchTerm) searchParams.append("searchTerm", params.searchTerm)
    if (params.contentType) searchParams.append("contentType", params.contentType)
    if (params.fromDate) searchParams.append("fromDate", params.fromDate)
    if (params.toDate) searchParams.append("toDate", params.toDate)
    if (params.folderId) searchParams.append("folderId", params.folderId)
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.sortDescending) searchParams.append("sortDescending", params.sortDescending.toString())

    return this.request<PaginatedResult<FileItem>>(`/files/search?${searchParams}`)
  }
}
