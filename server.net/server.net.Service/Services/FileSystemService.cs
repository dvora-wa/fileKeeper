using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Amazon.Runtime;
using Amazon;
using server.net.Core.DTOs;
using server.net.Core.Interfaces.Services;
using server.net.Data;
using server.net.Core.Entities;
using Microsoft.Extensions.Logging;
using server.net.Core.Interfaces.Repositories;
using server.net.Core.Models;

namespace server.net.Service.Services
{
    public class FileSystemService : IFileSystemService
    {
        private readonly IFileSystemRepository _fileSystemRepository;
        private readonly IS3StorageService _s3StorageService;
        private readonly ILogger<FileSystemService> _logger;

        public FileSystemService(
            IFileSystemRepository fileSystemRepository,
            IS3StorageService s3StorageService,
            ILogger<FileSystemService> logger)
        {
            _fileSystemRepository = fileSystemRepository;
            _s3StorageService = s3StorageService;
            _logger = logger;
        }

        // ===== Folder Operations =====
        public async Task<FolderDto> CreateFolderAsync(CreateFolderDto dto, Guid userId)
        {
            try
            {
                // ? בדיקה שהתיקייה האב קיימת (אם צוין)
                if (dto.ParentFolderId.HasValue)
                {
                    var parentExists = await _fileSystemRepository.FolderExistsAsync(dto.ParentFolderId.Value, userId);
                    if (!parentExists)
                    {
                        throw new InvalidOperationException("התיקייה האב לא נמצאה");
                    }
                }

                var folder = new Folder
                {
                    Name = dto.Name,
                    ParentFolderId = dto.ParentFolderId,
                    UserId = userId,
                    Description = dto.Description,
                    Color = dto.Color ?? "#3B82F6",
                    IsDeleted = false, // ? וודא במפורש
                    DeletedAt = null   // ? וודא במפורש
                };

                var createdFolder = await _fileSystemRepository.CreateFolderAsync(folder);

                _logger.LogInformation("Folder created: {FolderName} by user {UserId}", dto.Name, userId);

                return MapToFolderDto(createdFolder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating folder: {FolderName}", dto.Name);
                throw;
            }
        }

        public async Task<IEnumerable<FolderDto>> GetUserFoldersAsync(Guid userId, Guid? parentFolderId)
        {
            try
            {
                var folders = await _fileSystemRepository.GetUserFoldersAsync(userId, parentFolderId);
                return folders.Select(MapToFolderDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting folders for user {UserId}", userId);
                throw;
            }
        }

        public async Task<FolderDto> GetFolderByIdAsync(Guid folderId, Guid userId)
        {
            try
            {
                var folder = await _fileSystemRepository.GetFolderByIdAsync(folderId, userId);
                if (folder == null)
                {
                    throw new InvalidOperationException("תיקייה לא נמצאה");
                }

                return MapToFolderDto(folder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting folder {FolderId}", folderId);
                throw;
            }
        }

        public async Task UpdateFolderAsync(Guid folderId, CreateFolderDto dto, Guid userId)
        {
            try
            {
                // ? חיפוש מדויק עם בדיקת IsDeleted
                var folder = await _fileSystemRepository.GetFolderByIdAsync(folderId, userId);
                if (folder == null)
                {
                    throw new InvalidOperationException("תיקייה לא נמצאה");
                }

                // ? עדכון הערכים
                folder.Name = dto.Name;
                folder.Description = dto.Description;
                folder.Color = dto.Color ?? folder.Color;

                await _fileSystemRepository.UpdateFolderAsync(folder);

                _logger.LogInformation("Folder updated: {FolderId} by user {UserId}", folderId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating folder {FolderId}", folderId);
                throw;
            }
        }

        public async Task DeleteFolderAsync(Guid folderId, Guid userId)
        {
            try
            {
                // ? הפונקציה כבר מטפלת בבדיקת IsDeleted
                var success = await _fileSystemRepository.DeleteFolderAsync(userId, folderId);
                if (!success)
                {
                    throw new InvalidOperationException("תיקייה לא נמצאה");
                }

                _logger.LogInformation("Folder deleted: {FolderId} by user {UserId}", folderId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting folder {FolderId}", folderId);
                throw;
            }
        }

        // ===== File Operations =====
        public async Task<FileUploadUrlDto> GetUploadUrlAsync(string fileName, Guid folderId, Guid userId)
        {
            try
            {
                // ? בדיקה שהתיקייה קיימת ושייכת למשתמש
                var folderExists = await _fileSystemRepository.FolderExistsAsync(folderId, userId);
                if (!folderExists)
                {
                    throw new InvalidOperationException("תיקייה לא נמצאה");
                }

                // ? יצירת FileItem חדש - הId יוצר אוטומטית!
                var fileItem = new FileItem
                {
                    Name = fileName,
                    S3Key = "", // יעודכן אחרי שנקבל את הId
                    ContentType = GetContentType(fileName),
                    Size = 0, // יעודכן אחרי ההעלאה
                    FolderId = folderId,
                    UserId = userId,
                    IsDeleted = false, // ? וודא במפורש
                    DeletedAt = null   // ? וודא במפורש
                };

                // שמירה במסד נתונים כדי לקבל Id
                await _fileSystemRepository.CreateFileAsync(fileItem);

                // עכשיו נעדכן את S3Key עם הId הנכון
                var s3Key = $"{userId}/{folderId}/{fileItem.Id}-{fileName}";
                fileItem.S3Key = s3Key;
                await _fileSystemRepository.UpdateFileAsync(fileItem);

                var uploadUrl = await _s3StorageService.GenerateUploadUrlAsync(s3Key, fileItem.ContentType, 15);

                return new FileUploadUrlDto
                {
                    UploadUrl = uploadUrl,
                    FileId = fileItem.Id.ToString(),
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    S3Key = s3Key
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating upload URL for file: {FileName}", fileName);
                throw;
            }
        }

        public async Task<FileDownloadUrlDto> GetDownloadUrlAsync(Guid fileId, Guid userId)
        {
            try
            {
                var file = await _fileSystemRepository.GetFileByIdAsync(fileId, userId);
                if (file == null)
                {
                    throw new InvalidOperationException("קובץ לא נמצא");
                }

                var downloadUrl = await _s3StorageService.GenerateDownloadUrlAsync(file.S3Key, 15);

                return new FileDownloadUrlDto
                {
                    DownloadUrl = downloadUrl,
                    FileName = file.Name,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    FileSize = file.Size,
                    ContentType = file.ContentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating download URL for file: {FileId}", fileId);
                throw;
            }
        }

        public async Task<IEnumerable<FileItem>> GetFolderFilesAsync(Guid userId, Guid folderId)
        {
            try
            {
                return await _fileSystemRepository.GetFolderFilesAsync(userId, folderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting files for folder {FolderId}", folderId);
                throw;
            }
        }

        public async Task DeleteFileAsync(Guid fileId, Guid userId)
        {
            try
            {
                var file = await _fileSystemRepository.GetFileByIdAsync(fileId, userId);
                if (file == null)
                {
                    throw new InvalidOperationException("קובץ לא נמצא");
                }

                // מחיקה מS3
                await _s3StorageService.DeleteFileAsync(file.S3Key);

                // מחיקה ממסד הנתונים
                var success = await _fileSystemRepository.DeleteFileAsync(userId, fileId);
                if (!success)
                {
                    throw new InvalidOperationException("שגיאה במחיקת הקובץ");
                }

                _logger.LogInformation("File deleted: {FileId} by user {UserId}", fileId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FileId}", fileId);
                throw;
            }
        }

        public async Task<FileItemDto> GetFileByIdAsync(Guid fileId, Guid userId)
        {
            try
            {
                var file = await _fileSystemRepository.GetFileByIdAsync(fileId, userId);
                if (file == null)
                {
                    throw new InvalidOperationException("קובץ לא נמצא");
                }

                return MapToFileItemDto(file);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file {FileId}", fileId);
                throw;
            }
        }

        public async Task UpdateFileAsync(Guid fileId, FileItemDto dto, Guid userId)
        {
            try
            {
                var file = await _fileSystemRepository.GetFileByIdAsync(fileId, userId);
                if (file == null)
                {
                    throw new InvalidOperationException("קובץ לא נמצא");
                }

                file.Description = dto.Description;
                file.Tags = dto.Tags;
                file.IsPublic = dto.IsPublic;

                await _fileSystemRepository.UpdateFileAsync(file);

                _logger.LogInformation("File updated: {FileId} by user {UserId}", fileId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating file {FileId}", fileId);
                throw;
            }
        }

        // ===== Search Operations =====
        public async Task<PaginatedResult<FileItemDto>> SearchFilesAsync(Guid userId, SearchFilesDto searchDto)
        {
            try
            {
                var files = await _fileSystemRepository.SearchFilesAsync(
                    userId,
                    searchDto.SearchTerm,
                    searchDto.ContentType,
                    searchDto.FromDate,
                    searchDto.ToDate
                );

                // Apply sorting
                var sortedFiles = ApplySorting(files, searchDto.SortBy, searchDto.SortDescending);

                // Apply pagination
                var totalCount = sortedFiles.Count();
                var paginatedFiles = sortedFiles
                    .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                    .Take(searchDto.PageSize)
                    .ToList();

                return new PaginatedResult<FileItemDto>
                {
                    Items = paginatedFiles.Select(MapToFileItemDto).ToList(),
                    TotalCount = totalCount,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching files for user {UserId}", userId);
                throw;
            }
        }

        // ===== Additional Operations =====
        public async Task<long> GetUserStorageUsageAsync(Guid userId)
        {
            try
            {
                var files = await _fileSystemRepository.SearchFilesAsync(userId, null, null, null, null);
                return files.Sum(f => f.Size);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating storage usage for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<FileItemDto>> GetRecentFilesAsync(Guid userId, int count = 10)
        {
            try
            {
                var files = await _fileSystemRepository.SearchFilesAsync(userId, null, null, null, null);
                var recentFiles = files
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(count)
                    .ToList();

                return recentFiles.Select(MapToFileItemDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent files for user {UserId}", userId);
                throw;
            }
        }

        // ===== Helper Methods =====
        private static FolderDto MapToFolderDto(Folder folder)
        {
            return new FolderDto
            {
                Id = folder.Id,
                Name = folder.Name,
                ParentFolderId = folder.ParentFolderId,
                UserId = folder.UserId,
                CreatedAt = folder.CreatedAt,
                Description = folder.Description,
                Color = folder.Color,
                IsPublic = folder.IsPublic,
                IsFavorite = folder.IsFavorite,
                SubFolders = folder.SubFolders?.Select(MapToFolderDto).ToList() ?? new List<FolderDto>(),
                Files = folder.Files?.Select(MapToFileItemDto).ToList() ?? new List<FileItemDto>(),
                Path = "" // יתמלא לפי הצורך
            };
        }

        private static FileItemDto MapToFileItemDto(FileItem file)
        {
            return new FileItemDto
            {
                Id = file.Id,
                Name = file.Name,
                ContentType = file.ContentType,
                Size = file.Size,
                CreatedAt = file.CreatedAt,
                Description = file.Description,
                IsPublic = file.IsPublic,
                Tags = file.Tags,
                DownloadCount = file.DownloadCount,
                LastAccessedAt = file.LastAccessedAt
            };
        }

        private static IEnumerable<FileItem> ApplySorting(IEnumerable<FileItem> files, string? sortBy, bool sortDescending)
        {
            var query = files.AsQueryable();

            query = sortBy?.ToLower() switch
            {
                "name" => sortDescending ? query.OrderByDescending(f => f.Name) : query.OrderBy(f => f.Name),
                "size" => sortDescending ? query.OrderByDescending(f => f.Size) : query.OrderBy(f => f.Size),
                "contenttype" => sortDescending ? query.OrderByDescending(f => f.ContentType) : query.OrderBy(f => f.ContentType),
                _ => sortDescending ? query.OrderByDescending(f => f.CreatedAt) : query.OrderBy(f => f.CreatedAt)
            };

            return query;
        }

        private static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();

            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".txt" => "text/plain",
                ".csv" => "text/csv",
                ".mp4" => "video/mp4",
                ".avi" => "video/x-msvideo",
                ".mov" => "video/quicktime",
                ".mp3" => "audio/mpeg",
                ".wav" => "audio/wav",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                _ => "application/octet-stream"
            };
        }
    }
}