namespace FileKeeper_server_.net.Core.Models
{
    public class CreateFolderDto
    {
        public required string Name { get; set; }
        public Guid? ParentFolderId { get; set; }
    }
}