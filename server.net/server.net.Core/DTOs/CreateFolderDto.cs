using System.ComponentModel.DataAnnotations;

namespace server.net.Core.DTOs
{
    public class CreateFolderDto
    {
        [Required(ErrorMessage = "שם תיקייה הוא שדה חובה")]
        [StringLength(255, MinimumLength = 1, ErrorMessage = "שם תיקייה חייב להיות בין 1-255 תווים")]
        [RegularExpression(@"^[^<>:""/\\|?*]+$", ErrorMessage = "שם תיקייה מכיל תווים לא חוקיים")]
        public string Name { get; set; } = string.Empty;

        public Guid? ParentFolderId { get; set; }

        public string? Description { get; set; }

        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "צבע חייב להיות בפורמט hex (לדוגמה: #FF0000)")]
        public string? Color { get; set; }
    }

}