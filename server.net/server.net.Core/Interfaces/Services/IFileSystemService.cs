using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using server.net.Core.DTOs;
using server.net.Core.Entities;
using server.net.Core.Models;

namespace server.net.Core.Interfaces.Services
{
    public interface IFileSystemService
    {
        // Folder Operations
        Task<FolderDto> CreateFolderAsync(CreateFolderDto dto, Guid userId);
        Task<IEnumerable<FolderDto>> GetUserFoldersAsync(Guid userId, Guid? parentFolderId);
        Task<FolderDto> GetFolderByIdAsync(Guid folderId, Guid userId);
        Task UpdateFolderAsync(Guid folderId, CreateFolderDto dto, Guid userId);
        Task DeleteFolderAsync(Guid folderId, Guid userId);

        // File Operations
        Task<FileUploadUrlDto> GetUploadUrlAsync(string fileName, Guid folderId, Guid userId);
        Task<FileDownloadUrlDto> GetDownloadUrlAsync(Guid fileId, Guid userId);
        Task<IEnumerable<FileItem>> GetFolderFilesAsync(Guid userId, Guid folderId);
        Task DeleteFileAsync(Guid fileId, Guid userId);
        Task<FileItemDto> GetFileByIdAsync(Guid fileId, Guid userId);
        Task UpdateFileAsync(Guid fileId, FileItemDto dto, Guid userId);

        // Advanced Operations
        Task<PaginatedResult<FileItemDto>> SearchFilesAsync(Guid userId, SearchFilesDto searchDto);
        Task<long> GetUserStorageUsageAsync(Guid userId);
        Task<IEnumerable<FileItemDto>> GetRecentFilesAsync(Guid userId, int count = 10);
    }
}