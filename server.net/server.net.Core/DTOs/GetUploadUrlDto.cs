using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class GetUploadUrlDto
    {
        public string FileName { get; set; } = string.Empty;
        public Guid FolderId { get; set; }
    }
}
