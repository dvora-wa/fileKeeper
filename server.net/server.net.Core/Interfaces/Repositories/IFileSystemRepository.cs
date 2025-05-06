using FileKeeper_server_.net.Core.Entities;

namespace FileKeeper_server_.net.Core.Interfaces.Repositories
{
    public interface IFileSystemRepository
    {
        Task<IEnumerable<Folder>> GetUserFoldersAsync(int userId, Guid? parentFolderId);
        Task<Folder> CreateFolderAsync(Folder folder);
        Task<IEnumerable<FileItem>> GetFolderFilesAsync(int userId, Guid folderId);
        Task<FileItem> CreateFileAsync(FileItem file);
        Task<bool> DeleteFolderAsync(int userId, Guid folderId);
        Task<bool> DeleteFileAsync(int userId, Guid fileId);
    }
}