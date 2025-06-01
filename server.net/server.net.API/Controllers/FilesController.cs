using FileKeeper_server_.net.Core.Entities;
using FileKeeper_server_.net.Core.Interfaces.Services;
using FileKeeper_server_.net.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.net.Core.DTOs;

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

        public FilesController(IFileSystemService fileSystemService, IS3StorageService s3Service, DataContext context)
        {
            _fileSystemService = fileSystemService;
            _s3Service = s3Service;
            _context = context;
        }

        [HttpPost("upload-url")]
        public async Task<ActionResult<FileUploadUrlDto>> GetUploadUrl([FromBody] GetUploadUrlDto dto)
        {
            var userId = GetCurrentUserId();
            var result = await _fileSystemService.GetUploadUrlAsync(dto.FileName, dto.FolderId, userId);
            return Ok(result);
        }

        [HttpPost("direct-upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<FileItemDto>> DirectUpload([FromForm] DirectUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest("No file selected");

            var userId = GetCurrentUserId();

            var folderExists = await _context.Folders
                .AnyAsync(f => f.Id == dto.FolderId && f.UserId == userId);
            if (!folderExists)
                return BadRequest("Folder not found");

            var fileItem = new FileItem
            {
                Name = dto.File.FileName,
                ContentType = dto.File.ContentType,
                Size = dto.File.Length,
                FolderId = dto.FolderId,
                UserId = userId,
                S3Key = ""
            };

            _context.Files.Add(fileItem);
            await _context.SaveChangesAsync();

            var s3Key = $"{userId}/{dto.FolderId}/{fileItem.Id}-{dto.File.FileName}";
            fileItem.S3Key = s3Key;
            await _context.SaveChangesAsync();

            await _s3Service.UploadFileDirectlyAsync(s3Key, dto.File);

            return Ok(new FileItemDto
            {
                Id = fileItem.Id,
                Name = fileItem.Name,
                ContentType = fileItem.ContentType,
                Size = fileItem.Size,
                CreatedAt = fileItem.CreatedAt
            });
        }

        [HttpGet("folder/{folderId}")]
        public async Task<ActionResult<IEnumerable<FileItemDto>>> GetFolderFiles(Guid folderId)
        {
            var userId = GetCurrentUserId();
            var files = await _fileSystemService.GetFolderFilesAsync(userId, folderId);

            var result = files.Select(f => new FileItemDto
            {
                Id = f.Id,
                Name = f.Name,
                ContentType = f.ContentType,
                Size = f.Size,
                CreatedAt = f.CreatedAt
            });

            return Ok(result);
        }

        [HttpGet("download/{fileId}")]
        public async Task<ActionResult<FileDownloadUrlDto>> GetDownloadUrl(Guid fileId)
        {
            var userId = GetCurrentUserId();
            var result = await _fileSystemService.GetDownloadUrlAsync(fileId, userId);
            return Ok(result);
        }

        [HttpDelete("{fileId}")]
        public async Task<IActionResult> DeleteFile(Guid fileId)
        {
            var userId = GetCurrentUserId();
            await _fileSystemService.DeleteFileAsync(fileId, userId);
            return Ok();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<FileItemDto>>> SearchFiles(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? contentType = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var userId = GetCurrentUserId();
            var query = _context.Files.Where(f => f.UserId == userId);

            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Where(f => f.Name.Contains(searchTerm));

            if (!string.IsNullOrEmpty(contentType))
                query = query.Where(f => f.ContentType.StartsWith(contentType));

            if (fromDate.HasValue)
                query = query.Where(f => f.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(f => f.CreatedAt <= toDate.Value);

            var files = await query.OrderByDescending(f => f.CreatedAt).ToListAsync();

            var result = files.Select(f => new FileItemDto
            {
                Id = f.Id,
                Name = f.Name,
                ContentType = f.ContentType,
                Size = f.Size,
                CreatedAt = f.CreatedAt
            });

            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
