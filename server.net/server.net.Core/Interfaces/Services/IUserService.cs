using FileKeeper_server_.net.Core.Entities;
using FileKeeper_server_.net.Core.Models;

namespace FileKeeper_server_.net.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task<(User User, string Token)> Register(RegisterUserModel model);
        Task<(User User, string Token)> Login(LoginUserModel model);
        Task<User> GetUserById(int id);
        Task<IEnumerable<User>> GetAllUsers();
        Task UpdateUser(int id, UpdateUserModel model);
        Task DeleteUser(int id);
    }
}