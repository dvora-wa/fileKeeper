using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.net.Core.Models
{
    public class UpdateUserModel
    {
        [StringLength(50, MinimumLength = 2, ErrorMessage = "שם פרטי חייב להיות בין 2-50 תווים")]
        [RegularExpression(@"^[a-zA-Zא-ת\s]*$", ErrorMessage = "שם פרטי יכול להכיל רק אותיות ורווחים")]
        public string? FirstName { get; set; }

        [StringLength(50, MinimumLength = 2, ErrorMessage = "שם משפחה חייב להיות בין 2-50 תווים")]
        [RegularExpression(@"^[a-zA-Zא-ת\s]*$", ErrorMessage = "שם משפחה יכול להכיל רק אותיות ורווחים")]
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "כתובת מייל לא תקינה")]
        [StringLength(100, ErrorMessage = "כתובת מייל ארוכה מדי")]
        public string? Email { get; set; }

        [StringLength(100, MinimumLength = 6, ErrorMessage = "סיסמה חייבת להיות לפחות 6 תווים")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$",
            ErrorMessage = "סיסמה חייבת להכיל לפחות אות גדולה, אות קטנה ומספר")]
        public string? Password { get; set; }

        [Compare("Password", ErrorMessage = "אישור סיסמה לא תואם")]
        public string? ConfirmPassword { get; set; }
    }
}
