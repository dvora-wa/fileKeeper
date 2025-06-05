using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace server.net.Core.Interfaces.Services
{
    public interface IS3StorageService
    {
        Task<string> GenerateUploadUrlAsync(string key, string contentType, int expiryMinutes = 15);
        Task<string> GenerateDownloadUrlAsync(string key, int expiryMinutes = 15);
        Task UploadFileDirectlyAsync(string key, IFormFile file);
        Task<Stream> DownloadFileAsync(string key);
        Task DeleteFileAsync(string key);
        Task<bool> FileExistsAsync(string key);
        Task<long> GetFileSizeAsync(string key);
        Task CopyFileAsync(string sourceKey, string destinationKey);
        Task<string> GetFileUrlAsync(string key);
    }
}