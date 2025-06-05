using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class FolderDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid? ParentFolderId { get; set; }
        public Guid UserId { get; set; } // ✅ שונה מ-int ל-Guid
        public DateTime CreatedAt { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public bool IsPublic { get; set; }
        public bool IsFavorite { get; set; }
        public List<FolderDto> SubFolders { get; set; } = new();
        public List<FileItemDto> Files { get; set; } = new();

        // ✅ Helper properties
        public bool IsRootFolder => ParentFolderId == null;
        public int TotalFilesCount => Files.Count + SubFolders.Sum(sf => sf.TotalFilesCount);
        public string Path { get; set; } = string.Empty; // יתמלא ע"י השירות
    }
}
