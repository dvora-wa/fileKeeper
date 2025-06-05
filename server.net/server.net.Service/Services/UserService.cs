using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using server.net.Core.DTOs;
using server.net.Core.Entities;
using server.net.Core.Interfaces.Repositories;
using server.net.Core.Interfaces.Services;
using server.net.Core.Models;
using server.net.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace server.net.Service.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly DataContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            IConfiguration configuration,
            DataContext context,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        // JWT Token generation with improvements
        private string GenerateJwtToken(User user)
        {
            // Environment Variable first (for Render), then appsettings
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ??
                           _configuration["JwtSettings:Secret"] ??
                           throw new InvalidOperationException("JWT Secret is not configured");

            if (jwtSecret.Length < 32)
            {
                throw new InvalidOperationException("JWT Secret must be at least 32 characters long");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get expiry from environment or config
            var expiryMinutes = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES"), out int envMinutes)
                ? envMinutes
                : int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out int configMinutes)
                    ? configMinutes
                    : 60; // Default 60 minutes

            var expires = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("fullName", user.FullName),
                new Claim("isActive", user.IsActive.ToString()),
                new Claim("emailConfirmed", user.EmailConfirmed.ToString()),
                new Claim("iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ??
                        _configuration["JwtSettings:Issuer"] ??
                        "FileKeeper";

            var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ??
                          _configuration["JwtSettings:Audience"] ??
                          "FileKeeper.Client";

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Registration with validation and improvements - FIXED: No manual transactions
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            try
            {
                _logger.LogInformation("Registration attempt for email: {Email}", dto.Email);

                // Check existing user
                var existingUser = await _userRepository.GetByEmailAsync(dto.Email.ToLowerInvariant());
                if (existingUser is not null)
                {
                    _logger.LogWarning("Registration failed - email already exists: {Email}", dto.Email);
                    throw new InvalidOperationException("משתמש עם כתובת המייל הזו כבר קיים במערכת");
                }

                // Password strength validation
                if (!IsPasswordStrong(dto.Password))
                {
                    throw new InvalidOperationException("סיסמה חייבת להכיל לפחות 6 תווים, אות גדולה, אות קטנה ומספר");
                }

                // Create new user
                var user = new User
                {
                    FirstName = dto.FirstName.Trim(),
                    LastName = dto.LastName.Trim(),
                    Email = dto.Email.ToLowerInvariant(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                    Role = "User",
                    IsActive = true,
                    EmailConfirmed = false
                };

                _logger.LogInformation("Creating new user with ID: {UserId}", user.Id);

                // Save to database - FIXED: No manual transaction, let EF handle it
                user = await _userRepository.AddAsync(user);
                await _context.SaveChangesAsync();

                // Create root folder for user
                await CreateUserRootFolderAsync(user.Id);

                _logger.LogInformation("User created successfully: {UserId}", user.Id);

                // Generate token and update LastLogin
                var token = GenerateJwtToken(user);
                user.LastLoginAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
                await _context.SaveChangesAsync();

                var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out int configMinutes)
                    ? configMinutes
                    : 60; // Default 60 minutes

                return new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                    User = MapToUserDto(user)
                };
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
            {
                _logger.LogError(ex, "Database duplicate error for email: {Email}", dto.Email);
                throw new InvalidOperationException("משתמש עם כתובת המייל הזו כבר קיים במערכת");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for email: {Email}", dto.Email);
                throw;
            }
        }

        // Login with improvements
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", dto.Email);

                var user = await _userRepository.GetByEmailAsync(dto.Email.ToLowerInvariant());

                if (user is null)
                {
                    _logger.LogWarning("Login failed - user not found: {Email}", dto.Email);
                    throw new UnauthorizedAccessException("כתובת מייל או סיסמה שגויים");
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed - user inactive: {Email}", dto.Email);
                    throw new UnauthorizedAccessException("חשבון המשתמש אינו פעיל");
                }

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login failed - invalid password: {Email}", dto.Email);
                    throw new UnauthorizedAccessException("כתובת מייל או סיסמה שגויים");
                }

                // Update LastLogin
                user.LastLoginAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);

                _logger.LogInformation("Login successful for user: {UserId}", user.Id);

                var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out int configMinutes)
                    ? configMinutes
                    : 60; // Default 60 minutes

                return new AuthResponseDto
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                    User = MapToUserDto(user)
                };
            }
            catch (Exception ex) when (!(ex is UnauthorizedAccessException))
            {
                _logger.LogError(ex, "Unexpected error during login for email: {Email}", dto.Email);
                throw;
            }
        }

        // RefreshToken updated for Guid
        public async Task<AuthResponseDto> RefreshTokenAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedAccessException("משתמש לא נמצא או לא פעיל");
            }

            var token = GenerateJwtToken(user);
            var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out int configMinutes)
                ? configMinutes
                : 60; // Default 60 minutes

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                User = MapToUserDto(user)
            };
        }

        // GetUserById updated for Guid
        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("משתמש לא נמצא");
            }

            return MapToUserDto(user);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(MapToUserDto);
        }

        // UpdateUser updated for Guid
        public async Task UpdateUserAsync(Guid id, UpdateUserModel model)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("משתמש לא נמצא");
            }

            var hasChanges = false;

            if (!string.IsNullOrEmpty(model.FirstName) && model.FirstName != user.FirstName)
            {
                user.FirstName = model.FirstName.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrEmpty(model.LastName) && model.LastName != user.LastName)
            {
                user.LastName = model.LastName.Trim();
                hasChanges = true;
            }

            if (!string.IsNullOrEmpty(model.Email) && model.Email.ToLowerInvariant() != user.Email)
            {
                var existingUser = await _userRepository.GetByEmailAsync(model.Email.ToLowerInvariant());
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new InvalidOperationException("כתובת המייל כבר קיימת במערכת");
                }
                user.Email = model.Email.ToLowerInvariant();
                user.EmailConfirmed = false; // Require re-verification
                hasChanges = true;
            }

            if (!string.IsNullOrEmpty(model.Password))
            {
                if (!IsPasswordStrong(model.Password))
                {
                    throw new InvalidOperationException("סיסמה חייבת להכיל לפחות 6 תווים, אות גדולה, אות קטנה ומספר");
                }
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password, 12);
                hasChanges = true;
            }

            if (hasChanges)
            {
                await _userRepository.UpdateAsync(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation("User updated: {UserId}", user.Id);
            }
        }

        // DeleteUser updated for Guid with Soft Delete
        public async Task DeleteUserAsync(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("משתמש לא נמצא");
            }

            // Soft delete
            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            user.IsActive = false;

            await _userRepository.UpdateAsync(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation("User soft deleted: {UserId}", user.Id);
        }

        // Helper methods
        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                LastLoginAt = user.LastLoginAt,
                CreatedAt = user.CreatedAt
            };
        }

        private static bool IsPasswordStrong(string password)
        {
            if (password.Length < 6) return false;

            bool hasUpper = password.Any(char.IsUpper);
            bool hasLower = password.Any(char.IsLower);
            bool hasDigit = password.Any(char.IsDigit);

            return hasUpper && hasLower && hasDigit;
        }

        private async Task CreateUserRootFolderAsync(Guid userId)
        {
            var rootFolder = new Folder
            {
                Name = "המסמכים שלי",
                ParentFolderId = null,
                UserId = userId,
                Description = "תיקיית השורש שלך",
                Color = "#2196F3"
            };

            _context.Folders.Add(rootFolder);
            await _context.SaveChangesAsync();
        }
    }
}