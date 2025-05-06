using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileKeeper_server_.net.Core.Models
{
    public class FileItemDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string ContentType { get; set; }
        public long Size { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
