using System;
using System.Collections.Generic;

namespace FileKeeper_server_.net.Core.Models
{
    public class FolderDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<FolderDto> SubFolders { get; set; } = new();
        public List<FileItemDto> Files { get; set; } = new();
    }
}