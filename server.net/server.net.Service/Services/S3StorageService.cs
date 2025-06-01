using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3.Model;
using Amazon.S3;
using FileKeeper_server_.net.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Amazon;

namespace server.net.Service.Services
{
    public class S3StorageService : IS3StorageService, IDisposable
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private bool _disposed;

        public S3StorageService(IConfiguration configuration)
        {
            var awsAccessKey = configuration["AWS:AccessKey"] ??
                throw new InvalidOperationException("AWS:AccessKey is not configured");
            var awsSecretKey = configuration["AWS:SecretKey"] ??
                throw new InvalidOperationException("AWS:SecretKey is not configured");
            var awsRegion = configuration["AWS:Region"] ??
                throw new InvalidOperationException("AWS:Region is not configured");
            _bucketName = configuration["AWS:BucketName"] ??
                throw new InvalidOperationException("AWS:BucketName is not configured");

            var credentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
            _s3Client = new AmazonS3Client(credentials, RegionEndpoint.GetBySystemName(awsRegion));
        }

        public async Task<string> GenerateUploadUrlAsync(string key, string contentType)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.AddMinutes(15),
                ContentType = contentType
            };

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
        }

        public async Task<string> GenerateDownloadUrlAsync(string key)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddMinutes(15)
            };

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
        }

        public async Task UploadFileDirectlyAsync(string key, IFormFile file)
        {
            using var stream = file.OpenReadStream();

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            await _s3Client.PutObjectAsync(request);
        }

        public async Task DeleteFileAsync(string key)
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(request);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                _s3Client?.Dispose();
                _disposed = true;
            }
        }

    }
}
