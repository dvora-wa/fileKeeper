using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.net.Core.DTOs;
using server.net.Core.Entities;
using server.net.Core.Interfaces.Services;
using server.net.Core.Models;
using server.net.Data;
using server.net.Service.Services;

namespace server.net.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;
        private readonly IS3StorageService _s3Service;
        private readonly DataContext _context;
        private readonly ILogger<FilesController> _logger;

        public FilesController(
            IFileSystemService fileSystemService,
            IS3StorageService s3Service,
            DataContext context,
            ILogger<FilesController> logger)
        {
            _fileSystemService = fileSystemService;
            _s3Service = s3Service;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// קבלת URL להעלאת קובץ (Pre-Signed URL)
        /// </summary>
        [HttpPost("upload-url")]
        [ProducesResponseType(typeof(FileUploadUrlDto), 200)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<ActionResult<FileUploadUrlDto>> GetUploadUrl([FromBody] GetUploadUrlDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var result = await _fileSystemService.GetUploadUrlAsync(dto.FileName, dto.FolderId, userId);

                _logger.LogInformation("Upload URL generated for file: {FileName} by user {UserId}", dto.FileName, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating upload URL for file: {FileName}", dto.FileName);
                return StatusCode(500, new { error = "שגיאה ביצירת קישור ההעלאה" });
            }
        }

        [HttpPost("direct-upload")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(100_000_000)]
        public async Task<ActionResult<FileItemDto>> DirectUpload([FromForm] DirectUploadDto dto)
        {
            var userId = GetCurrentUserId();

            _logger.LogInformation("Starting upload: user={UserId}, folder={FolderId}", userId, dto.FolderId);

            if (dto.File is null)
                return BadRequest(new { error = "לא נבחר קובץ" });

            _logger.LogInformation("File: {Name} ({Size} bytes, {Type})",
                dto.File.FileName, dto.File.Length, dto.File.ContentType);

            // ✅ בדיקת תיקייה משופרת עם לוגים
            _logger.LogInformation("Checking if folder {FolderId} exists for user {UserId}", dto.FolderId, userId);

            var folder = await _context.Folders
                .Where(f => f.Id == dto.FolderId && f.UserId == userId && !f.IsDeleted)
                .FirstOrDefaultAsync();

            if (folder is null)
            {
                _logger.LogWarning("Folder {FolderId} not found for user {UserId}", dto.FolderId, userId);

                // ✅ הצג תיקיות זמינות בלוג
                var availableFolders = await _context.Folders
                    .Where(f => f.UserId == userId && !f.IsDeleted)
                    .Select(f => new { f.Id, f.Name })
                    .ToListAsync();

                _logger.LogInformation("Available folders for user {UserId}: {@Folders}", userId, availableFolders);

                return BadRequest(new
                {
                    error = "תיקייה לא נמצאה",
                    folderId = dto.FolderId,
                    availableFolders = availableFolders
                });
            }

            _logger.LogInformation("Folder found: {FolderName}", folder.Name);

            var fileId = Guid.NewGuid();
            var s3Key = $"{userId}/{dto.FolderId}/{fileId}-{dto.File.FileName}";

            var fileItem = new FileItem
            {
                Id = fileId,
                Name = dto.File.FileName,
                S3Key = s3Key,
                ContentType = dto.File.ContentType ?? "application/octet-stream",
                Size = dto.File.Length,
                FolderId = dto.FolderId,
                UserId = userId,
                Description = dto.Description,
                Tags = dto.Tags,
                IsDeleted = false,
                DeletedAt = null
            };

            try
            {
                _logger.LogInformation("Saving to DB and uploading to S3...");

                _context.Files.Add(fileItem);
                await _context.SaveChangesAsync();

                await _s3Service.UploadFileDirectlyAsync(s3Key, dto.File);

                _logger.LogInformation("Upload completed successfully: {FileId}", fileId);

                return Ok(new FileItemDto
                {
                    Id = fileItem.Id,
                    Name = fileItem.Name,
                    ContentType = fileItem.ContentType,
                    Size = fileItem.Size,
                    CreatedAt = fileItem.CreatedAt,
                    Description = fileItem.Description,
                    Tags = fileItem.Tags
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upload failed: {Message}", ex.Message);

                return StatusCode(500, new
                {
                    error = "שגיאה בהעלאת הקובץ",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// קבלת קבצי תיקייה
        /// </summary>
        [HttpGet("folder/{folderId}")]
        [ProducesResponseType(typeof(IEnumerable<FileItemDto>), 200)]
        public async Task<ActionResult<IEnumerable<FileItemDto>>> GetFolderFiles(Guid folderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var files = await _fileSystemService.GetFolderFilesAsync(userId, folderId);

                var result = files.Select(f => new FileItemDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    ContentType = f.ContentType,
                    Size = f.Size,
                    CreatedAt = f.CreatedAt,
                    Description = f.Description,
                    IsPublic = f.IsPublic,
                    Tags = f.Tags,
                    DownloadCount = f.DownloadCount,
                    LastAccessedAt = f.LastAccessedAt
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting folder files: {FolderId}", folderId);
                return StatusCode(500, new { error = "שגיאה בטעינת הקבצים" });
            }
        }

        /// <summary>
        /// קבלת קישור הורדה לקובץ
        /// </summary>
        [HttpGet("download/{fileId}")]
        [ProducesResponseType(typeof(FileDownloadUrlDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<FileDownloadUrlDto>> GetDownloadUrl(Guid fileId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _fileSystemService.GetDownloadUrlAsync(fileId, userId);

                // עדכון מספר ההורדות
                await UpdateDownloadCountAsync(fileId);

                _logger.LogInformation("Download URL generated for file: {FileId} by user {UserId}", fileId, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating download URL for file: {FileId}", fileId);
                return StatusCode(500, new { error = "שגיאה ביצירת קישור ההורדה" });
            }
        }

        /// <summary>
        /// מחיקת קובץ
        /// </summary>
        [HttpDelete("{fileId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _fileSystemService.DeleteFileAsync(fileId, userId);

                _logger.LogInformation("File deleted: {FileId} by user {UserId}", fileId, userId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FileId}", fileId);
                return StatusCode(500, new { error = "שגיאה במחיקת הקובץ" });
            }
        }

        /// <summary>
        /// חיפוש קבצים
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(PaginatedResult<FileItemDto>), 200)]
        public async Task<ActionResult<PaginatedResult<FileItemDto>>> SearchFiles([FromQuery] SearchFilesDto searchDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var query = _context.Files.Where(f => f.UserId == userId && !f.IsDeleted);

                if (!string.IsNullOrEmpty(searchDto.SearchTerm))
                    query = query.Where(f => f.Name.Contains(searchDto.SearchTerm));

                if (!string.IsNullOrEmpty(searchDto.ContentType))
                    query = query.Where(f => f.ContentType.StartsWith(searchDto.ContentType));

                if (searchDto.FromDate.HasValue)
                    query = query.Where(f => f.CreatedAt >= searchDto.FromDate.Value);

                if (searchDto.ToDate.HasValue)
                    query = query.Where(f => f.CreatedAt <= searchDto.ToDate.Value);

                if (searchDto.FolderId.HasValue)
                    query = query.Where(f => f.FolderId == searchDto.FolderId.Value);

                // סורטינג
                query = searchDto.SortBy?.ToLower() switch
                {
                    "name" => searchDto.SortDescending ? query.OrderByDescending(f => f.Name) : query.OrderBy(f => f.Name),
                    "size" => searchDto.SortDescending ? query.OrderByDescending(f => f.Size) : query.OrderBy(f => f.Size),
                    "contenttype" => searchDto.SortDescending ? query.OrderByDescending(f => f.ContentType) : query.OrderBy(f => f.ContentType),
                    _ => searchDto.SortDescending ? query.OrderByDescending(f => f.CreatedAt) : query.OrderBy(f => f.CreatedAt)
                };

                var totalCount = await query.CountAsync();
                var files = await query
                    .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                    .Take(searchDto.PageSize)
                    .ToListAsync();

                var result = new PaginatedResult<FileItemDto>
                {
                    Items = files.Select(f => new FileItemDto
                    {
                        Id = f.Id,
                        Name = f.Name,
                        ContentType = f.ContentType,
                        Size = f.Size,
                        CreatedAt = f.CreatedAt,
                        Description = f.Description,
                        IsPublic = f.IsPublic,
                        Tags = f.Tags,
                        DownloadCount = f.DownloadCount,
                        LastAccessedAt = f.LastAccessedAt
                    }).ToList(),
                    TotalCount = totalCount,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching files");
                return StatusCode(500, new { error = "שגיאה בחיפוש הקבצים" });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (Guid.TryParse(userIdClaim, out Guid userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("מזהה משתמש לא תקין");
        }

        private static bool IsAllowedFileType(IFormFile file)
        {
            var allowedTypes = new[]
            {
                "image/", "video/", "audio/", "application/pdf",
                "application/msword", "application/vnd.openxmlformats-officedocument",
                "text/", "application/zip", "application/x-rar"
            };

            return allowedTypes.Any(type => file.ContentType?.StartsWith(type) == true);
        }

        private async Task UpdateDownloadCountAsync(Guid fileId)
        {
            try
            {
                var file = await _context.Files.FindAsync(fileId);
                if (file != null)
                {
                    file.DownloadCount++;
                    file.LastAccessedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update download count for file: {FileId}", fileId);
                // לא זורקים exception כי זה לא קריטי
            }
        }
    }
}