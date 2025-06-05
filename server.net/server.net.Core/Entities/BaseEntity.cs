using System;
using System.ComponentModel.DataAnnotations;

namespace server.net.Core.Entities
{
    public abstract class BaseEntity
    {
        [Required]
        public DateTime CreatedAt { get; set; } 

        [Required]
        public DateTime UpdatedAt { get; set; } 

        // ✅ הוסף שדות מועילים
        public string? CreatedBy { get; set; } // מי יצר
        public string? UpdatedBy { get; set; } // מי עדכן

        // ✅ Version control לOptimistic Concurrency
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}
