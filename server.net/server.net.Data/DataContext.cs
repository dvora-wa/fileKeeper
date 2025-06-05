using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using server.net.Core.Entities;

namespace server.net.Data
{
    //public class DataContext : DbContext
    //{
    //    private readonly IHttpContextAccessor? _httpContextAccessor;

    //    public DataContext(DbContextOptions<DataContext> options, IHttpContextAccessor? httpContextAccessor = null)
    //        : base(options)
    //    {
    //        _httpContextAccessor = httpContextAccessor;
    //    }

    //    public DbSet<User> Users { get; set; } = null!;
    //    public DbSet<Folder> Folders { get; set; } = null!;
    //    public DbSet<FileItem> Files { get; set; } = null!;

    //    protected override void OnModelCreating(ModelBuilder modelBuilder)
    //    {
    //        base.OnModelCreating(modelBuilder);

    //        // ? User Configuration
    //        modelBuilder.Entity<User>(entity =>
    //        {
    //            entity.HasKey(e => e.Id);
    //            entity.HasIndex(e => e.Email).IsUnique();
    //            entity.HasIndex(e => e.IsDeleted);

    //            // Soft delete filter
    //            entity.HasQueryFilter(e => !e.IsDeleted);

    //            // One-to-many relationships
    //            entity.HasMany(e => e.Folders)
    //                  .WithOne(e => e.User)
    //                  .HasForeignKey(e => e.UserId)
    //                  .OnDelete(DeleteBehavior.Cascade);

    //            entity.HasMany(e => e.Files)
    //                  .WithOne(e => e.User)
    //                  .HasForeignKey(e => e.UserId)
    //                  .OnDelete(DeleteBehavior.Cascade);
    //        });

    //        // ? Folder Configuration
    //        modelBuilder.Entity<Folder>(entity =>
    //        {
    //            entity.HasKey(e => e.Id);
    //            entity.HasIndex(e => new { e.UserId, e.ParentFolderId });
    //            entity.HasIndex(e => e.IsDeleted);

    //            // Soft delete filter
    //            entity.HasQueryFilter(e => !e.IsDeleted);

    //            // Self-referencing relationship
    //            entity.HasOne(e => e.ParentFolder)
    //                  .WithMany(e => e.SubFolders)
    //                  .HasForeignKey(e => e.ParentFolderId)
    //                  .OnDelete(DeleteBehavior.Restrict);

    //            // Files relationship
    //            entity.HasMany(e => e.Files)
    //                  .WithOne(e => e.Folder)
    //                  .HasForeignKey(e => e.FolderId)
    //                  .OnDelete(DeleteBehavior.Cascade);
    //        });

    //        // ? FileItem Configuration
    //        modelBuilder.Entity<FileItem>(entity =>
    //        {
    //            entity.HasKey(e => e.Id);
    //            entity.HasIndex(e => new { e.UserId, e.FolderId });
    //            entity.HasIndex(e => e.S3Key).IsUnique();
    //            entity.HasIndex(e => e.IsDeleted);
    //            entity.HasIndex(e => e.ContentType);
    //            entity.HasIndex(e => e.CreatedAt);

    //            // Soft delete filter
    //            entity.HasQueryFilter(e => !e.IsDeleted);
    //        });
    //    }

    //    // ? Override SaveChanges לטיפול אוטומטי בתאריכים
    //    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    //    {
    //        var currentUser = GetCurrentUserId();
    //        var now = DateTime.UtcNow;

    //        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
    //        {
    //            switch (entry.State)
    //            {
    //                case EntityState.Added:
    //                    entry.Entity.CreatedAt = now;
    //                    entry.Entity.UpdatedAt = now;
    //                    if (!string.IsNullOrEmpty(currentUser))
    //                    {
    //                        entry.Entity.CreatedBy = currentUser;
    //                        entry.Entity.UpdatedBy = currentUser;
    //                    }
    //                    break;

    //                case EntityState.Modified:
    //                    entry.Entity.UpdatedAt = now;
    //                    if (!string.IsNullOrEmpty(currentUser))
    //                    {
    //                        entry.Entity.UpdatedBy = currentUser;
    //                    }
    //                    // מנע שינוי של CreatedAt
    //                    entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
    //                    entry.Property(nameof(BaseEntity.CreatedBy)).IsModified = false;
    //                    break;
    //            }
    //        }

    //        try
    //        {
    //            return await base.SaveChangesAsync(cancellationToken);
    //        }
    //        catch (DbUpdateConcurrencyException ex)
    //        {
    //            // טיפול בOptimistic Concurrency conflicts
    //            throw new InvalidOperationException("The record was modified by another user. Please refresh and try again.", ex);
    //        }
    //    }

    //    public override int SaveChanges()
    //    {
    //        return SaveChangesAsync().GetAwaiter().GetResult();
    //    }

    //    private string? GetCurrentUserId()
    //    {
    //        return _httpContextAccessor?.HttpContext?.User?.FindFirst("userId")?.Value;
    //    }
    //}

    public class DataContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public DataContext(DbContextOptions<DataContext> options, IHttpContextAccessor? httpContextAccessor = null)
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Folder> Folders { get; set; } = null!;
        public DbSet<FileItem> Files { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.IsDeleted);

                // Soft delete filter
                entity.HasQueryFilter(e => !e.IsDeleted);

                // One-to-many relationships
                entity.HasMany(e => e.Folders)
                      .WithOne(e => e.User)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Files)
                      .WithOne(e => e.User)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Folder Configuration
            modelBuilder.Entity<Folder>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.ParentFolderId });
                entity.HasIndex(e => e.IsDeleted);

                // Soft delete filter
                entity.HasQueryFilter(e => !e.IsDeleted);

                // Self-referencing relationship
                entity.HasOne(e => e.ParentFolder)
                      .WithMany(e => e.SubFolders)
                      .HasForeignKey(e => e.ParentFolderId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Files relationship
                entity.HasMany(e => e.Files)
                      .WithOne(e => e.Folder)
                      .HasForeignKey(e => e.FolderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // FileItem Configuration
            modelBuilder.Entity<FileItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.UserId, e.FolderId });
                entity.HasIndex(e => e.S3Key).IsUnique();
                entity.HasIndex(e => e.IsDeleted);
                entity.HasIndex(e => e.ContentType);
                entity.HasIndex(e => e.CreatedAt);

                // Soft delete filter
                entity.HasQueryFilter(e => !e.IsDeleted);
            });
        }

        // Override SaveChanges to handle audit fields automatically
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var currentUser = GetCurrentUserId();
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = now;
                        entry.Entity.UpdatedAt = now;
                        if (!string.IsNullOrEmpty(currentUser))
                        {
                            entry.Entity.CreatedBy = currentUser;
                            entry.Entity.UpdatedBy = currentUser;
                        }
                        break;

                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = now;
                        if (!string.IsNullOrEmpty(currentUser))
                        {
                            entry.Entity.UpdatedBy = currentUser;
                        }
                        // Don't modify CreatedAt and CreatedBy on updates
                        entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
                        entry.Property(nameof(BaseEntity.CreatedBy)).IsModified = false;
                        break;
                }
            }

            try
            {
                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                // Handle Optimistic Concurrency conflicts
                throw new InvalidOperationException("The record was modified by another user. Please refresh and try again.", ex);
            }
        }

        public override int SaveChanges()
        {
            return SaveChangesAsync().GetAwaiter().GetResult();
        }

        private string? GetCurrentUserId()
        {
            return _httpContextAccessor?.HttpContext?.User?.FindFirst("userId")?.Value;
        }
    }
}