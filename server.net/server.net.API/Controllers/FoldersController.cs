using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.net.Core.DTOs;
using server.net.Core.Interfaces.Services;

namespace server.net.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FoldersController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;
        private readonly ILogger<FoldersController> _logger;

        public FoldersController(IFileSystemService fileSystemService, ILogger<FoldersController> logger)
        {
            _fileSystemService = fileSystemService;
            _logger = logger;
        }

        /// <summary>
        /// יצירת תיקייה חדשה
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(FolderDto), 200)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<ActionResult<FolderDto>> CreateFolder([FromBody] CreateFolderDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var result = await _fileSystemService.CreateFolderAsync(dto, userId);

                _logger.LogInformation("Folder created: {FolderName} by user {UserId}", dto.Name, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating folder: {FolderName}", dto.Name);
                return StatusCode(500, new { error = "שגיאה ביצירת התיקייה" });
            }
        }

        /// <summary>
        /// קבלת תיקיות המשתמש
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<FolderDto>), 200)]
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
                _logger.LogError(ex, "Error getting folders for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { error = "שגיאה בטעינת התיקיות" });
            }
        }

        /// <summary>
        /// קבלת תיקייה ספציפית
        /// </summary>
        [HttpGet("{folderId}")]
        [ProducesResponseType(typeof(FolderDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<FolderDto>> GetFolder(Guid folderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var folders = await _fileSystemService.GetUserFoldersAsync(userId, null);

                // חיפוש רקורסיבי של התיקייה
                var folder = FindFolderRecursive(folders, folderId);
                if (folder == null)
                {
                    return NotFound(new { error = "תיקייה לא נמצאה" });
                }

                return Ok(folder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting folder {FolderId}", folderId);
                return StatusCode(500, new { error = "שגיאה בטעינת התיקייה" });
            }
        }

        /// <summary>
        /// מחיקת תיקייה
        /// </summary>
        [HttpDelete("{folderId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteFolder(Guid folderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _fileSystemService.DeleteFolderAsync(folderId, userId);

                _logger.LogInformation("Folder deleted: {FolderId} by user {UserId}", folderId, userId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting folder {FolderId}", folderId);
                return StatusCode(500, new { error = "שגיאה במחיקת התיקייה" });
            }
        }

        /// <summary>
        /// עדכון תיקייה
        /// </summary>
        [HttpPut("{folderId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateFolder(Guid folderId, [FromBody] CreateFolderDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                await _fileSystemService.UpdateFolderAsync(folderId, dto, userId);

                _logger.LogInformation("Folder updated: {FolderId} by user {UserId}", folderId, userId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating folder {FolderId}", folderId);
                return StatusCode(500, new { error = "שגיאה בעדכון התיקייה" });
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

        private static FolderDto? FindFolderRecursive(IEnumerable<FolderDto> folders, Guid folderId)
        {
            foreach (var folder in folders)
            {
                if (folder.Id == folderId)
                    return folder;

                var found = FindFolderRecursive(folder.SubFolders, folderId);
                if (found != null)
                    return found;
            }
            return null;
        }
    }
}