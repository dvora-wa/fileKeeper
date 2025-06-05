using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace server.net.Core.Entities
{
    public class Folder : BaseEntity
    {
        public Folder()
        {
            Id = Guid.NewGuid();  // רק הGuid!
            SubFolders = new List<Folder>();
            Files = new List<FileItem>();
        }
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Name { get; set; }

        public Guid? ParentFolderId { get; set; }

        // ? שונה מ-int ל-Guid
        [Required]
        public required Guid UserId { get; set; }

        // ? הוסף שדות שימושיים
        public string? Description { get; set; }
        public string? Color { get; set; } = "#2196F3"; // צבע ברירת מחדל
        public bool IsPublic { get; set; } = false;
        public bool IsFavorite { get; set; } = false;

        // ? Soft delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual Folder? ParentFolder { get; set; }
        public virtual ICollection<Folder> SubFolders { get; set; } = new List<Folder>();
        public virtual ICollection<FileItem> Files { get; set; } = new List<FileItem>();

        // ? Helper properties
        public bool IsRootFolder => ParentFolderId == null;
        public int TotalFilesCount => Files.Count + SubFolders.Sum(sf => sf.TotalFilesCount);
        public long TotalSize => Files.Sum(f => f.Size) + SubFolders.Sum(sf => sf.TotalSize);
        public string TotalSizeFormatted => FormatFileSize(TotalSize);

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