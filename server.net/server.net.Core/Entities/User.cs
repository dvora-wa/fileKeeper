using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace server.net.Core.Entities
{
    public class User : BaseEntity
    {
        public User()
        {
            Id = Guid.NewGuid();  // רק הGuid!
            Folders = new List<Folder>();
            Files = new List<FileItem>();
        }
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [MaxLength(50)]
        public required string LastName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "User";

        // ✅ הוסף שדות נוספים שימושיים
        public bool IsActive { get; set; } = true;
        public bool EmailConfirmed { get; set; } = false;
        public DateTime? LastLoginAt { get; set; }

        // ✅ Soft delete support
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<Folder> Folders { get; set; } = new List<Folder>();
        public virtual ICollection<FileItem> Files { get; set; } = new List<FileItem>();

        // ✅ Helper properties
        public string FullName => $"{FirstName} {LastName}";
        public bool IsAdmin => Role == "Admin";
    }
}