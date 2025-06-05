using server.net.Core.Entities;

namespace server.net.Core.Interfaces.Repositories
{
    public interface IFileSystemRepository
    {
        // Folder Operations
        Task<IEnumerable<Folder>> GetUserFoldersAsync(Guid userId, Guid? parentFolderId);
        Task<Folder> CreateFolderAsync(Folder folder);
        Task<Folder?> GetFolderByIdAsync(Guid folderId, Guid userId);
        Task UpdateFolderAsync(Folder folder);
        Task<bool> DeleteFolderAsync(Guid userId, Guid folderId);
        Task<bool> FolderExistsAsync(Guid folderId, Guid userId);

        // File Operations
        Task<IEnumerable<FileItem>> GetFolderFilesAsync(Guid userId, Guid folderId);
        Task<FileItem> CreateFileAsync(FileItem file);
        Task<FileItem?> GetFileByIdAsync(Guid fileId, Guid userId);
        Task UpdateFileAsync(FileItem file);
        Task<bool> DeleteFileAsync(Guid userId, Guid fileId);
        Task<bool> FileExistsAsync(Guid fileId, Guid userId);

        // Search Operations
        Task<IEnumerable<FileItem>> SearchFilesAsync(Guid userId, string? searchTerm,
            string? contentType, DateTime? fromDate, DateTime? toDate);
    }
}