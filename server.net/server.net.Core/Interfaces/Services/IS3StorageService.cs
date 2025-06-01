using FileKeeper_server_.net.Core.Entities;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace FileKeeper_server_.net.Core.Interfaces.Services
{
    public interface IS3StorageService
    {
        Task<string> GenerateUploadUrlAsync(string key, string contentType);
        Task<string> GenerateDownloadUrlAsync(string key);
        Task UploadFileDirectlyAsync(string key, IFormFile file);
        Task DeleteFileAsync(string key);
    }
}