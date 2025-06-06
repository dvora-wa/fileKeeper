﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.DTOs

{
    public class FileDownloadUrlDto
    {
        public string DownloadUrl { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
    }
}
