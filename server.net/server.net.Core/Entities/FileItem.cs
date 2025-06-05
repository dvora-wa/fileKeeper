using System;
using System.ComponentModel.DataAnnotations;

namespace server.net.Core.Entities
{
    public class FileItem : BaseEntity
    {
        public FileItem()
        {
            Id = Guid.NewGuid();  // רק הGuid!
        }

        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(500)]
        public required string S3Key { get; set; }

        [Required]
        [MaxLength(100)]
        public required string ContentType { get; set; }

        [Range(0, long.MaxValue)]
        public long Size { get; set; }

        [Required]
        public required Guid FolderId { get; set; }

        // ? שונה מ-int ל-Guid
        [Required]
        public required Guid UserId { get; set; }

        // ? הוסף שדות שימושיים
        public string? Description { get; set; }
        public bool IsPublic { get; set; } = false;
        public string? Tags { get; set; } // JSON array של tags
        public int DownloadCount { get; set; } = 0;
        public DateTime? LastAccessedAt { get; set; }

        // ? Soft delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual Folder? Folder { get; set; }

        // ? Helper properties
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