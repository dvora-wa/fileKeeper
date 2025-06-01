using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace server.net.Core.DTOs
{
    public class DirectUploadDto
    {
        public IFormFile File { get; set; } = null!;
        public Guid FolderId { get; set; }
    }
}
