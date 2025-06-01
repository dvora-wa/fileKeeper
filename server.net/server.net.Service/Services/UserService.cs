using FileKeeper_server_.net.Core.Entities;
using FileKeeper_server_.net.Core.Interfaces.Repositories;
using FileKeeper_server_.net.Core.Interfaces.Services;
using FileKeeper_server_.net.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using server.net.Core.DTOs;
using server.net.Core.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FileKeeper_server_.net.Service.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly DataContext _context;

        public UserService(IUserRepository userRepository, IConfiguration configuration, DataContext context)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _context = context;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSecret = _configuration["JwtSettings:Secret"] ??
                throw new InvalidOperationException("JWT Secret is not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddHours(72);

            var token = new JwtSecurityToken(
                claims: new[]
                {
                    new Claim("userId", user.Id.ToString()), // שינוי כאן!
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.GivenName, user.FirstName),
                    new Claim(ClaimTypes.Surname, user.LastName),
                    new Claim(ClaimTypes.Role, user.Role)
                },
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        //{
        //    var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        //    if (existingUser != null)
        //    {
        //        throw new InvalidOperationException("User with this email already exists");
        //    }

        //    var user = new User
        //    {
        //        FirstName = dto.FirstName,
        //        LastName = dto.LastName,
        //        Email = dto.Email,
        //        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        //    };

        //    user = await _userRepository.AddAsync(user);
        //    var token = GenerateJwtToken(user);

        //    return new AuthResponseDto
        //    {
        //        Token = token,
        //        User = new UserDto
        //        {
        //            Id = user.Id,
        //            FirstName = user.FirstName,
        //            LastName = user.LastName,
        //            Email = user.Email,
        //            Role = user.Role
        //        }
        //    };
        //}
        //public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        //{
        //    try
        //    {
        //        Console.WriteLine($"RegisterAsync called for email: {dto.Email}");
        //        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        //        Console.WriteLine($"Existing user found: {existingUser != null}");
        //        if (existingUser != null)
        //        {
        //            Console.WriteLine("User already exists - throwing exception");
        //            throw new InvalidOperationException("User with this email already exists");
        //        }

        //        var user = new User
        //        {
        //            FirstName = dto.FirstName,
        //            LastName = dto.LastName,
        //            Email = dto.Email,
        //            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        //        };
        //        Console.WriteLine("About to add user to database");
        //        user = await _userRepository.AddAsync(user);
        //        var token = GenerateJwtToken(user);

        //        return new AuthResponseDto 
        //        {
        //            Token = token,
        //            User = new UserDto
        //            {
        //                Id = user.Id,
        //                FirstName = user.FirstName,
        //                LastName = user.LastName,
        //                Email = user.Email,
        //                Role = user.Role
        //            }
        //        };
        //    }
        //    catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
        //    {
        //        Console.WriteLine($"Database duplicate error: {ex.InnerException?.Message}");
        //        throw new InvalidOperationException("User with this email already exists");
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Unexpected error: {ex.Message}");
        //        throw;
        //    }
        //}
        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            try
            {
                Console.WriteLine($"RegisterAsync called for email: {dto.Email}");

                var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                Console.WriteLine($"Existing user found: {existingUser != null}");

                if (existingUser != null)
                {
                    Console.WriteLine("User already exists - throwing exception");
                    throw new InvalidOperationException("User with this email already exists");
                }

                var user = new User
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
                };

                Console.WriteLine("About to add user to database");

                // הוסף ל-context (אבל עדיין לא שמור)
                user = await _userRepository.AddAsync(user);

                // עכשיו שמור - כאן תתפס את ה-duplicate exception!
                await _context.SaveChangesAsync();

                Console.WriteLine($"User saved successfully with ID: {user.Id}");

                var token = GenerateJwtToken(user);

                return new AuthResponseDto
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        Role = user.Role
                    }
                };
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
            {
                Console.WriteLine($"Database duplicate error: {ex.InnerException?.Message}");
                throw new InvalidOperationException("User with this email already exists");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role
            });
        }

        public async Task UpdateUserAsync(int id, UpdateUserModel model)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            if (!string.IsNullOrEmpty(model.FirstName)) user.FirstName = model.FirstName;
            if (!string.IsNullOrEmpty(model.LastName)) user.LastName = model.LastName;

            if (!string.IsNullOrEmpty(model.Email))
            {
                var existingUser = await _userRepository.GetByEmailAsync(model.Email);
                if (existingUser != null && existingUser.Id != id)
                {
                    throw new InvalidOperationException("Email already exists");
                }
                user.Email = model.Email;
            }

            if (!string.IsNullOrEmpty(model.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);
            }

            await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }
            await _userRepository.DeleteAsync(user);
        }

    }
}
