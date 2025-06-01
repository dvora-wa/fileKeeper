using System;

namespace FileKeeper_server_.net.Core.Entities
{
    public class FileItem : BaseEntity
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string S3Key { get; set; }
        public required string ContentType { get; set; }
        public long Size { get; set; }
        public required Guid FolderId { get; set; }
        public required int UserId { get; set; }

        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual Folder? Folder { get; set; }
    }
}