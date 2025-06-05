using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.net.Core.DTOs;
using server.net.Core.Interfaces.Services;
using System.ComponentModel.DataAnnotations;

namespace server.net.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// רישום משתמש חדש
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
        {
            try
            {
                // ✅ Model validation אוטומטי
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _userService.RegisterAsync(dto);

                _logger.LogInformation("User registered successfully: {Email}", dto.Email);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Registration failed: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration");
                return StatusCode(500, new { error = "אירעה שגיאה בהרשמה. נסה שוב מאוחר יותר." });
            }
        }

        /// <summary>
        /// התחברות משתמש
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _userService.LoginAsync(dto);

                _logger.LogInformation("User logged in successfully: {Email}", dto.Email);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Login failed: {Message}", ex.Message);
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login");
                return StatusCode(500, new { error = "אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר." });
            }
        }

        /// <summary>
        /// רענון טוקן
        /// </summary>
        [HttpPost("refresh")]
        [Authorize]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.RefreshTokenAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token refresh failed");
                return Unauthorized(new { error = "רענון הטוקן נכשל" });
            }
        }

        /// <summary>
        /// התנתקות (לוגיקת client-side בעיקר)
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // בגישה stateless עם JWT, הלוגאוט הוא client-side
            // כאן אפשר להוסיף blacklist של tokens אם נדרש
            return Ok(new { message = "התנתקת בהצלחה" });
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
    }
}