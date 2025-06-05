using Microsoft.EntityFrameworkCore;
using server.net.Core.Entities;
using server.net.Core.Interfaces.Repositories;

namespace server.net.Data.Repositories
{
    public class FileSystemRepository : IFileSystemRepository
    {
        private readonly DataContext _context;

        public FileSystemRepository(DataContext context)
        {
            _context = context;
        }

        // ===== Folder Operations =====
        public async Task<IEnumerable<Folder>> GetUserFoldersAsync(Guid userId, Guid? parentFolderId)
        {
            return await _context.Folders
                .Where(f => f.UserId == userId &&
                           f.ParentFolderId == parentFolderId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .Include(f => f.SubFolders.Where(sf => !sf.IsDeleted))
                .Include(f => f.Files.Where(file => !file.IsDeleted))
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<Folder> CreateFolderAsync(Folder folder)
        {
            if (folder.Id == Guid.Empty)
            {
                folder.Id = Guid.NewGuid();
            }

            // ? וודא שהערכים נקיים
            folder.IsDeleted = false;
            folder.DeletedAt = null;

            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<Folder?> GetFolderByIdAsync(Guid folderId, Guid userId)
        {
            return await _context.Folders
                .Where(f => f.Id == folderId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .Include(f => f.SubFolders.Where(sf => !sf.IsDeleted))
                .Include(f => f.Files.Where(file => !file.IsDeleted))
                .FirstOrDefaultAsync();
        }

        public async Task UpdateFolderAsync(Folder folder)
        {
            // ? וודא שהתיקייה קיימת ולא מחוקה לפני העדכון
            var existingFolder = await _context.Folders
                .Where(f => f.Id == folder.Id && !f.IsDeleted)
                .FirstOrDefaultAsync();

            if (existingFolder == null)
            {
                throw new InvalidOperationException("תיקייה לא נמצאה או נמחקה");
            }

            _context.Folders.Update(folder);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteFolderAsync(Guid userId, Guid folderId)
        {
            // ? חפש תיקייה שלא מחוקה
            var folder = await _context.Folders
                .Where(f => f.Id == folderId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? רק תיקיות לא מחוקות
                .Include(f => f.SubFolders.Where(sf => !sf.IsDeleted))
                .Include(f => f.Files.Where(file => !file.IsDeleted))
                .FirstOrDefaultAsync();

            if (folder == null) return false;

            // ? Soft delete רקורסיבי
            await SoftDeleteFolderRecursiveAsync(folder);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FolderExistsAsync(Guid folderId, Guid userId)
        {
            return await _context.Folders
                .Where(f => f.Id == folderId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .AnyAsync();
        }

        // ===== File Operations =====
        public async Task<IEnumerable<FileItem>> GetFolderFilesAsync(Guid userId, Guid folderId)
        {
            return await _context.Files
                .Where(f => f.UserId == userId &&
                           f.FolderId == folderId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<FileItem> CreateFileAsync(FileItem file)
        {
            if (file.Id == Guid.Empty)
            {
                file.Id = Guid.NewGuid();
            }

            // ? וודא שהערכים נקיים
            file.IsDeleted = false;
            file.DeletedAt = null;

            _context.Files.Add(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<FileItem?> GetFileByIdAsync(Guid fileId, Guid userId)
        {
            return await _context.Files
                .Where(f => f.Id == fileId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .Include(f => f.Folder)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateFileAsync(FileItem file)
        {
            // ? וודא שהקובץ קיים ולא מחוק לפני העדכון
            var existingFile = await _context.Files
                .Where(f => f.Id == file.Id && !f.IsDeleted)
                .FirstOrDefaultAsync();

            if (existingFile == null)
            {
                throw new InvalidOperationException("קובץ לא נמצא או נמחק");
            }

            _context.Files.Update(file);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteFileAsync(Guid userId, Guid fileId)
        {
            // ? חפש קובץ שלא מחוק
            var file = await _context.Files
                .Where(f => f.Id == fileId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? רק קבצים לא מחוקים
                .FirstOrDefaultAsync();

            if (file == null) return false;

            // ? Soft delete
            file.IsDeleted = true;
            file.DeletedAt = DateTime.UtcNow;

            await UpdateFileAsync(file);
            return true;
        }

        public async Task<bool> FileExistsAsync(Guid fileId, Guid userId)
        {
            return await _context.Files
                .Where(f => f.Id == fileId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? הוספתי במפורש
                .AnyAsync();
        }

        // ===== Search Operations =====
        public async Task<IEnumerable<FileItem>> SearchFilesAsync(Guid userId, string? searchTerm,
            string? contentType, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Files
                .Where(f => f.UserId == userId && !f.IsDeleted); // ? הוספתי במפורש

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(f => f.Name.Contains(searchTerm) ||
                                       (f.Description != null && f.Description.Contains(searchTerm)) ||
                                       (f.Tags != null && f.Tags.Contains(searchTerm)));
            }

            if (!string.IsNullOrEmpty(contentType))
            {
                query = query.Where(f => f.ContentType.StartsWith(contentType));
            }

            if (fromDate.HasValue)
            {
                query = query.Where(f => f.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(f => f.CreatedAt <= toDate.Value);
            }

            return await query
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        // ===== Helper Methods =====
        private async Task SoftDeleteFolderRecursiveAsync(Folder folder)
        {
            // ? מחק את כל הקבצים בתיקייה
            var files = await _context.Files
                .Where(f => f.FolderId == folder.Id && !f.IsDeleted)
                .ToListAsync();

            foreach (var file in files)
            {
                file.IsDeleted = true;
                file.DeletedAt = DateTime.UtcNow;
            }

            // ? מחק את כל תת-התיקיות רקורסיבית
            var subFolders = await _context.Folders
                .Where(f => f.ParentFolderId == folder.Id && !f.IsDeleted)
                .ToListAsync();

            foreach (var subFolder in subFolders)
            {
                await SoftDeleteFolderRecursiveAsync(subFolder);
            }

            // ? מחק את התיקייה עצמה
            folder.IsDeleted = true;
            folder.DeletedAt = DateTime.UtcNow;
        }
    }
}