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
                           !f.IsDeleted) // ? ������ ������
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

            // ? ���� ������� �����
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
                           !f.IsDeleted) // ? ������ ������
                .Include(f => f.SubFolders.Where(sf => !sf.IsDeleted))
                .Include(f => f.Files.Where(file => !file.IsDeleted))
                .FirstOrDefaultAsync();
        }

        public async Task UpdateFolderAsync(Folder folder)
        {
            // ? ���� �������� ����� ��� ����� ���� ������
            var existingFolder = await _context.Folders
                .Where(f => f.Id == folder.Id && !f.IsDeleted)
                .FirstOrDefaultAsync();

            if (existingFolder == null)
            {
                throw new InvalidOperationException("������ �� ����� �� �����");
            }

            _context.Folders.Update(folder);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteFolderAsync(Guid userId, Guid folderId)
        {
            // ? ��� ������ ��� �����
            var folder = await _context.Folders
                .Where(f => f.Id == folderId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? �� ������ �� ������
                .Include(f => f.SubFolders.Where(sf => !sf.IsDeleted))
                .Include(f => f.Files.Where(file => !file.IsDeleted))
                .FirstOrDefaultAsync();

            if (folder == null) return false;

            // ? Soft delete ��������
            await SoftDeleteFolderRecursiveAsync(folder);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FolderExistsAsync(Guid folderId, Guid userId)
        {
            return await _context.Folders
                .Where(f => f.Id == folderId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? ������ ������
                .AnyAsync();
        }

        // ===== File Operations =====
        public async Task<IEnumerable<FileItem>> GetFolderFilesAsync(Guid userId, Guid folderId)
        {
            return await _context.Files
                .Where(f => f.UserId == userId &&
                           f.FolderId == folderId &&
                           !f.IsDeleted) // ? ������ ������
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<FileItem> CreateFileAsync(FileItem file)
        {
            if (file.Id == Guid.Empty)
            {
                file.Id = Guid.NewGuid();
            }

            // ? ���� ������� �����
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
                           !f.IsDeleted) // ? ������ ������
                .Include(f => f.Folder)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateFileAsync(FileItem file)
        {
            // ? ���� ������ ���� ��� ���� ���� ������
            var existingFile = await _context.Files
                .Where(f => f.Id == file.Id && !f.IsDeleted)
                .FirstOrDefaultAsync();

            if (existingFile == null)
            {
                throw new InvalidOperationException("���� �� ���� �� ����");
            }

            _context.Files.Update(file);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteFileAsync(Guid userId, Guid fileId)
        {
            // ? ��� ���� ��� ����
            var file = await _context.Files
                .Where(f => f.Id == fileId &&
                           f.UserId == userId &&
                           !f.IsDeleted) // ? �� ����� �� ������
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
                           !f.IsDeleted) // ? ������ ������
                .AnyAsync();
        }

        // ===== Search Operations =====
        public async Task<IEnumerable<FileItem>> SearchFilesAsync(Guid userId, string? searchTerm,
            string? contentType, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Files
                .Where(f => f.UserId == userId && !f.IsDeleted); // ? ������ ������

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
            // ? ��� �� �� ������ �������
            var files = await _context.Files
                .Where(f => f.FolderId == folder.Id && !f.IsDeleted)
                .ToListAsync();

            foreach (var file in files)
            {
                file.IsDeleted = true;
                file.DeletedAt = DateTime.UtcNow;
            }

            // ? ��� �� �� ��-������� ���������
            var subFolders = await _context.Folders
                .Where(f => f.ParentFolderId == folder.Id && !f.IsDeleted)
                .ToListAsync();

            foreach (var subFolder in subFolders)
            {
                await SoftDeleteFolderRecursiveAsync(subFolder);
            }

            // ? ��� �� ������� ����
            folder.IsDeleted = true;
            folder.DeletedAt = DateTime.UtcNow;
        }
    }
}