using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class FileUploadUrlDto
    {
        public string UploadUrl { get; set; } = string.Empty;
        public string FileId { get; set; } = string.Empty;
    }
}
