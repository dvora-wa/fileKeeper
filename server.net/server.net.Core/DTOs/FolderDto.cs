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
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<FolderDto> SubFolders { get; set; } = new();
        public List<FileItemDto> Files { get; set; } = new();
    }
}
