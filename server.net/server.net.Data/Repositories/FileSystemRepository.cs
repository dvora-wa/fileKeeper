using FileKeeper_server_.net.Core.Entities;
using FileKeeper_server_.net.Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FileKeeper_server_.net.Data.Repositories
{
    public class FileSystemRepository : IFileSystemRepository
    {
        private readonly DataContext _context;

        public FileSystemRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Folder>> GetUserFoldersAsync(int userId, Guid? parentFolderId)
        {
            return await _context.Folders
                .Where(f => f.UserId == userId && f.ParentFolderId == parentFolderId)
                .ToListAsync();
        }

        public async Task<Folder> CreateFolderAsync(Folder folder)
        {
            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<IEnumerable<FileItem>> GetFolderFilesAsync(int userId, Guid folderId)
        {
            return await _context.Files
                .Where(f => f.UserId == userId && f.FolderId == folderId)
                .ToListAsync();
        }

        public async Task<FileItem> CreateFileAsync(FileItem file)
        {
            _context.Files.Add(file);
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<bool> DeleteFolderAsync(int userId, Guid folderId)
        {
            var folder = await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == folderId && f.UserId == userId);

            if (folder == null) return false;

            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteFileAsync(int userId, Guid fileId)
        {
            var file = await _context.Files
                .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId);

            if (file == null) return false;

            _context.Files.Remove(file);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}