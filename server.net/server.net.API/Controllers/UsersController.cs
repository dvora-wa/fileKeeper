using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using server.net.Core.Models;
using Microsoft.AspNetCore.Authorization;
using server.net.Core.DTOs;
using server.net.Core.Interfaces.Services;

namespace server.net.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// קבלת פרטי משתמש לפי ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetUser(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                return Ok(user);
            }
            catch (InvalidOperationException)
            {
                return NotFound(new { error = "משתמש לא נמצא" });
            }
        }

        /// <summary>
        /// קבלת פרטי המשתמש המחובר
        /// </summary>
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserDto), 200)]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _userService.GetUserByIdAsync(userId);
                return Ok(user);
            }
            catch (InvalidOperationException)
            {
                return NotFound(new { error = "משתמש לא נמצא" });
            }
        }

        /// <summary>
        /// עדכון פרטי משתמש
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // בדיקה שהמשתמש יכול לעדכן רק את עצמו (אלא אם כן הוא Admin)
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                if (currentUserId != id && currentUserRole != "Admin")
                {
                    return Forbid("אתה יכול לעדכן רק את הפרופיל שלך");
                }

                await _userService.UpdateUserAsync(id, model);
                _logger.LogInformation("User updated: {UserId} by {CurrentUserId}", id, currentUserId);

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// מחיקת משתמש
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                // בדיקה שהמשתמש יכול למחוק רק את עצמו (אלא אם כן הוא Admin)
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                if (currentUserId != id && currentUserRole != "Admin")
                {
                    return Forbid("אתה יכול למחוק רק את הפרופיל שלך");
                }

                await _userService.DeleteUserAsync(id);
                _logger.LogInformation("User deleted: {UserId} by {CurrentUserId}", id, currentUserId);

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// קבלת כל המשתמשים (Admin בלבד)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto>), 200)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// מחיקת משתמש על ידי Admin
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> AdminDeleteUser(Guid id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                _logger.LogInformation("User deleted by admin: {UserId}", id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Helper methods
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (Guid.TryParse(userIdClaim, out Guid userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("מזהה משתמש לא תקין");
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        }
    }
}
