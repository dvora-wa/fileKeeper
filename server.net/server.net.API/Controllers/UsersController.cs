using FileKeeper_server_.net.Core.Interfaces.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.net.Core.Models;
using Microsoft.AspNetCore.Authorization;

namespace server.net.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserModel model)
        {
            // בדיקה שהמשתמש יכול לעדכן רק את עצמו (אלא אם כן הוא Admin)
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            if (currentUserId != id && currentUserRole != "Admin")
            {
                throw new UnauthorizedAccessException("You can only update your own profile");
            }

            await _userService.UpdateUserAsync(id, model);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // בדיקה שהמשתמש יכול למחוק רק את עצמו (אלא אם כן הוא Admin)
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            if (currentUserId != id && currentUserRole != "Admin")
            {
                throw new UnauthorizedAccessException("You can only delete your own profile");
            }

            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> AdminDeleteUser(int id)
        {
            // Admin יכול למחוק כל משתמש
            await _userService.DeleteUserAsync(id);
            return NoContent();
        }

        // מתודות עזר
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return 0;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        }
    }
}
