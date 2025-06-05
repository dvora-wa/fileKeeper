using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace server.net.Core.DTOs
{
    public class DirectUploadDto
    {
        [Required(ErrorMessage = "קובץ נדרש")]
        public IFormFile File { get; set; } = null!;

        [Required(ErrorMessage = "מזהה תיקייה נדרש")]
        public Guid FolderId { get; set; }

        public string? Description { get; set; }

        public string? Tags { get; set; }
    }
}