using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class CreateFolderDto
    {
        public string Name { get; set; } = string.Empty;
        public Guid? ParentFolderId { get; set; }
    }
}
