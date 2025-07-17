using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs
{
    public class ConfirmUploadDto
    {
        public string FileId { get; set; } = null!;
        public string? Description { get; set; }
        public string? Tags { get; set; }
    }
}

