using server.net.Core.DTOs;
using server.net.Core.Models;

namespace server.net.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> RefreshTokenAsync(Guid userId);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task UpdateUserAsync(Guid id, UpdateUserModel model);
        Task DeleteUserAsync(Guid id);
    }
}