using FileKeeper_server_.net.Core.Entities;
using server.net.Core.DTOs;
using server.net.Core.Models;

namespace FileKeeper_server_.net.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> RefreshTokenAsync(int userId);
        Task<UserDto> GetUserByIdAsync(int id);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task UpdateUserAsync(int id, UpdateUserModel model);
        Task DeleteUserAsync(int id);
    }
}