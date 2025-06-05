using System.ComponentModel.DataAnnotations;

namespace server.net.Core.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "כתובת מייל היא שדה חובה")]
        [EmailAddress(ErrorMessage = "כתובת מייל לא תקינה")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "סיסמה היא שדה חובה")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "סיסמה נדרשת")]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; } = false;
    }
}