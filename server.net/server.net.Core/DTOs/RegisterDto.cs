using System.ComponentModel.DataAnnotations;

namespace server.net.Core.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "שם פרטי הוא שדה חובה")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "שם פרטי חייב להיות בין 2-50 תווים")]
        [RegularExpression(@"^[a-zA-Zא-ת\s]+$", ErrorMessage = "שם פרטי יכול להכיל רק אותיות ורווחים")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "שם משפחה הוא שדה חובה")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "שם משפחה חייב להיות בין 2-50 תווים")]
        [RegularExpression(@"^[a-zA-Zא-ת\s]+$", ErrorMessage = "שם משפחה יכול להכיל רק אותיות ורווחים")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "כתובת מייל היא שדה חובה")]
        [EmailAddress(ErrorMessage = "כתובת מייל לא תקינה")]
        [StringLength(100, ErrorMessage = "כתובת מייל ארוכה מדי")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "סיסמה היא שדה חובה")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "סיסמה חייבת להיות לפחות 6 תווים")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$",
            ErrorMessage = "סיסמה חייבת להכיל לפחות אות גדולה, אות קטנה ומספר")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "אישור סיסמה לא תואם")]
        public string? ConfirmPassword { get; set; }
    }
}