using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.Models
{
    public class SearchFilesDto
    {
        [StringLength(100, ErrorMessage = "מונח חיפוש ארוך מדי")]
        public string? SearchTerm { get; set; }

        public string? ContentType { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public Guid? FolderId { get; set; }

        [Range(1, 100, ErrorMessage = "גודל דף חייב להיות בין 1-100")]
        public int PageSize { get; set; } = 20;

        [Range(1, int.MaxValue, ErrorMessage = "מספר דף חייב להיות חיובי")]
        public int PageNumber { get; set; } = 1;

        public string? SortBy { get; set; } = "CreatedAt";

        public bool SortDescending { get; set; } = true;
    }
}
