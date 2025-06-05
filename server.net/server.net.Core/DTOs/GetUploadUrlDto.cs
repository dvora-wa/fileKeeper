using System.ComponentModel.DataAnnotations;

namespace server.net.Core.DTOs
{
    public class GetUploadUrlDto
    {
        [Required(ErrorMessage = "שם קובץ הוא שדה חובה")]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "שם קובץ חייב להיות בין 1-255 תווים")]
        [RegularExpression(@"^[^<>:""/\\|?*]+\.[a-zA-Z0-9]+$", ErrorMessage = "שם קובץ לא תקין או חסרה סיומת")]
        public string FileName { get; set; } = string.Empty;

        [Required(ErrorMessage = "מזהה תיקייה נדרש")]
        public Guid FolderId { get; set; }

        public string? ContentType { get; set; }
    }
}