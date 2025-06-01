using FileKeeper_server_.net.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.net.Core.DTOs;

namespace server.net.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FoldersController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;

        public FoldersController(IFileSystemService fileSystemService)
        {
            _fileSystemService = fileSystemService;
        }

        [HttpPost]
        public async Task<ActionResult<FolderDto>> CreateFolder([FromBody] CreateFolderDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _fileSystemService.CreateFolderAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FolderDto>>> GetFolders([FromQuery] Guid? parentFolderId = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _fileSystemService.GetUserFoldersAsync(userId, parentFolderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{folderId}")]
        public async Task<IActionResult> DeleteFolder(Guid folderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _fileSystemService.DeleteFolderAsync(folderId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}
