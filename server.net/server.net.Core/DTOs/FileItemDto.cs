using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class FileItemDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long Size { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
        public string? Tags { get; set; }
        public int DownloadCount { get; set; }
        public DateTime? LastAccessedAt { get; set; }

        // ✅ Helper properties
        public string SizeFormatted => FormatFileSize(Size);
        public string FileExtension => Path.GetExtension(Name);
        public bool IsImage => ContentType.StartsWith("image/");
        public bool IsVideo => ContentType.StartsWith("video/");
        public bool IsDocument => ContentType.Contains("pdf") ||
                                 ContentType.Contains("word") ||
                                 ContentType.Contains("excel");

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }

}
