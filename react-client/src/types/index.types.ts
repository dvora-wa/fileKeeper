export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface FileItem {
  id: string;
  name: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId?: string;
  userId: number;
  createdAt: string;
  subFolders: Folder[];
  files: FileItem[];
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
}

export interface FileUploadUrl {
  uploadUrl: string;
  fileId: string;
}

export interface FileDownloadUrl {
  downloadUrl: string;
  fileName: string;
}