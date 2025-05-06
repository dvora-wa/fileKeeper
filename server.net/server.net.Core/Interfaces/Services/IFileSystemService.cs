using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FileKeeper_server_.net.Core.Models;
using FileKeeper_server_.net.Core.Entities;

namespace FileKeeper_server_.net.Core.Interfaces.Services
{
    public interface IFileSystemService
    {
        Task<FolderDto> CreateFolderAsync(CreateFolderDto dto, int userId);
        Task<IEnumerable<FolderDto>> GetUserFoldersAsync(int userId, Guid? parentFolderId);
        Task<FileUploadUrlDto> GetUploadUrlAsync(string fileName, Guid folderId, int userId);
        Task<FileDownloadUrlDto> GetDownloadUrlAsync(Guid fileId, int userId);
        Task DeleteFolderAsync(Guid folderId, int userId);
        Task DeleteFileAsync(Guid fileId, int userId);
        Task<IEnumerable<FileItem>> GetFolderFilesAsync(int userId, Guid folderId);
    }
}