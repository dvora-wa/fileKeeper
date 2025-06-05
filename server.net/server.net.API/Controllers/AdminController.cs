using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.net.Data;
using Microsoft.EntityFrameworkCore;

namespace server.net.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(DataContext context, ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // 🔓 Endpoint להפיכה לAdmin (זמני - לפיתוח בלבד!)
        [HttpPost("make-me-admin")]
        public async Task<IActionResult> MakeMeAdmin()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ??
                             User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("לא מזוהה");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("משתמש לא נמצא");
            }

            user.Role = "Admin";
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} ({Email}) became admin", userId, user.Email);

            return Ok(new { message = "נהייתה מנהל!", role = user.Role });
        }

        // 📋 רשימת כל המשתמשים (Admin בלבד)
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => !u.IsDeleted)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Role,
                    u.IsActive,
                    u.EmailConfirmed,
                    u.CreatedAt,
                    FilesCount = _context.Files.Count(f => f.UserId == u.Id && !f.IsDeleted),
                    FoldersCount = _context.Folders.Count(f => f.UserId == u.Id && !f.IsDeleted)
                })
                .ToListAsync();

            return Ok(users);
        }

        // 🗑️ מחיקת משתמש (Admin בלבד)
        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var currentUserId = User.FindFirst("userId")?.Value;

            if (currentUserId == id.ToString())
            {
                return BadRequest("לא ניתן למחוק את עצמך");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("משתמש לא נמצא");
            }

            // Soft delete
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;

            // Mark user's files and folders as deleted
            var userFiles = await _context.Files
                .Where(f => f.UserId == id && !f.IsDeleted)
                .ToListAsync();

            var userFolders = await _context.Folders
                .Where(f => f.UserId == id && !f.IsDeleted)
                .ToListAsync();

            foreach (var file in userFiles)
            {
                file.IsDeleted = true;
                file.DeletedAt = DateTime.UtcNow;
            }

            foreach (var folder in userFolders)
            {
                folder.IsDeleted = true;
                folder.DeletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogWarning("Admin deleted user {UserId} ({Email})", id, user.Email);

            return Ok(new { message = "משתמש נמחק בהצלחה" });
        }

        // 📊 סטטיסטיקות מערכת (Admin בלבד)
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetSystemStats()
        {
            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(u => !u.IsDeleted),
                ActiveUsers = await _context.Users.CountAsync(u => !u.IsDeleted && u.IsActive),
                TotalFiles = await _context.Files.CountAsync(f => !f.IsDeleted),
                TotalFolders = await _context.Folders.CountAsync(f => !f.IsDeleted),
                TotalStorageUsed = await _context.Files
                    .Where(f => !f.IsDeleted)
                    .SumAsync(f => f.Size),
                RecentFiles = await _context.Files
                    .Where(f => !f.IsDeleted)
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(5)
                    .Select(f => new { f.Name, f.CreatedAt, f.Size })
                    .ToListAsync()
            };

            return Ok(stats);
        }
    }
}
