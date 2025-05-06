using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FileKeeper_server_.net.Core.Interfaces.Services;
using FileKeeper_server_.net.Core.Models;
using FileKeeper_server_.net.Core.Entities;

namespace FileKeeper_server_.net.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileSystemController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;

        public FileSystemController(IFileSystemService fileSystemService)
        {
            _fileSystemService = fileSystemService;
        }

        [HttpGet("folders")]
        public async Task<ActionResult<IEnumerable<FolderDto>>> GetFolders([FromQuery] Guid? parentFolderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var folders = await _fileSystemService.GetUserFoldersAsync(userId, parentFolderId);
            return Ok(folders);
        }

        [HttpPost("folders")]
        public async Task<ActionResult<FolderDto>> CreateFolder([FromBody] CreateFolderDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var folder = await _fileSystemService.CreateFolderAsync(dto, userId);
            return Ok(folder);
        }

        [HttpGet("folders/{folderId}/files")]
        public async Task<ActionResult<IEnumerable<FileItem>>> GetFolderFiles(Guid folderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var files = await _fileSystemService.GetFolderFilesAsync(userId, folderId);
            return Ok(files);
        }

        [HttpGet("files/upload")]
        public async Task<ActionResult<FileUploadUrlDto>> GetUploadUrl([FromQuery] string fileName, [FromQuery] Guid folderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var uploadUrl = await _fileSystemService.GetUploadUrlAsync(fileName, folderId, userId);
            return Ok(uploadUrl);
        }

        [HttpGet("files/{fileId}/download")]
        public async Task<ActionResult<FileDownloadUrlDto>> GetDownloadUrl(Guid fileId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var downloadUrl = await _fileSystemService.GetDownloadUrlAsync(fileId, userId);
            return Ok(downloadUrl);
        }

        [HttpDelete("folders/{folderId}")]
        public async Task<ActionResult> DeleteFolder(Guid folderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _fileSystemService.DeleteFolderAsync(folderId, userId);
            return NoContent();
        }

        [HttpDelete("files/{fileId}")]
        public async Task<ActionResult> DeleteFile(Guid fileId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _fileSystemService.DeleteFileAsync(fileId, userId);
            return NoContent();
        }
    }
}