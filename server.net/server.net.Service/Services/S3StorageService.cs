using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Amazon;
using server.net.Core.Interfaces.Services;

namespace server.net.Service.Services
{
    public class S3StorageService : IS3StorageService, IDisposable
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private bool _disposed;

        public S3StorageService(IConfiguration configuration)
        {
            // ✅ Environment Variables first (for Render), then appsettings
            var awsAccessKey = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY") ??
                              configuration["AWS:AccessKey"] ??
                              throw new InvalidOperationException("AWS Access Key is not configured");

            var awsSecretKey = Environment.GetEnvironmentVariable("AWS_SECRET_KEY") ??
                              configuration["AWS:SecretKey"] ??
                              throw new InvalidOperationException("AWS Secret Key is not configured");

            var awsRegion = Environment.GetEnvironmentVariable("AWS_REGION") ??
                           configuration["AWS:Region"] ??
                           throw new InvalidOperationException("AWS Region is not configured");

            _bucketName = Environment.GetEnvironmentVariable("AWS_BUCKET_NAME") ??
                         configuration["AWS:BucketName"] ??
                         throw new InvalidOperationException("AWS Bucket Name is not configured");

            var credentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);

            // ✅ הוספת ForcePathStyle לתיקון שגיאת 418
            var config = new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.GetBySystemName(awsRegion),
                ForcePathStyle = true, // זה יכול לפתור שגיאות bucket
                UseHttp = false // HTTPS only
            };

            _s3Client = new AmazonS3Client(credentials, config);

            Console.WriteLine($"✅ S3 configured for bucket: {_bucketName} in region: {awsRegion}");
            Console.WriteLine($"✅ ForcePathStyle: {config.ForcePathStyle}");
        }

        public async Task<string> GenerateUploadUrlAsync(string key, string contentType, int expiryMinutes = 15)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                ContentType = contentType
            };

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
        }

        public async Task<string> GenerateDownloadUrlAsync(string key, int expiryMinutes = 15)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };

            return await Task.FromResult(_s3Client.GetPreSignedURL(request));
        }

        public async Task UploadFileDirectlyAsync(string key, IFormFile file)
        {
            try
            {
                Console.WriteLine($"=== S3 UPLOAD DEBUG ===");
                Console.WriteLine($"Bucket: {_bucketName}");
                Console.WriteLine($"Key: {key}");
                Console.WriteLine($"File: {file.FileName} ({file.Length} bytes)");
                Console.WriteLine($"Region: {_s3Client.Config.RegionEndpoint?.SystemName}");

                // ✅ בדיקה אם הbucket קיים
                try
                {
                    await _s3Client.GetBucketLocationAsync(_bucketName);
                    Console.WriteLine("✅ Bucket exists and accessible");
                }
                catch (Exception bucketEx)
                {
                    Console.WriteLine($"❌ Bucket issue: {bucketEx.Message}");
                    throw new InvalidOperationException($"בעיה בגישה ל-bucket: {bucketEx.Message}");
                }

                using var stream = file.OpenReadStream();

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType,
                    // ✅ הסרת encryption אם גורם לבעיות
                    // ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                };

                Console.WriteLine("Uploading to S3...");
                var response = await _s3Client.PutObjectAsync(request);

                Console.WriteLine($"✅ Upload successful! Status: {response.HttpStatusCode}");
                Console.WriteLine($"ETag: {response.ETag}");
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.WriteLine($"=== S3 ERROR DETAILS ===");
                Console.WriteLine($"Error Code: {s3Ex.ErrorCode}");
                Console.WriteLine($"Error Type: {s3Ex.ErrorType}");
                Console.WriteLine($"Status Code: {s3Ex.StatusCode}");
                Console.WriteLine($"Message: {s3Ex.Message}");
                Console.WriteLine($"Request ID: {s3Ex.RequestId}");

                // ✅ טיפול בשגיאות נפוצות
                var errorMessage = s3Ex.ErrorCode switch
                {
                    "NoSuchBucket" => "הbucket לא קיים",
                    "AccessDenied" => "אין הרשאות גישה ל-bucket",
                    "InvalidAccessKeyId" => "מפתח גישה AWS לא תקין",
                    "SignatureDoesNotMatch" => "מפתח סודי AWS לא תקין",
                    _ => $"שגיאת S3: {s3Ex.ErrorCode} - {s3Ex.Message}"
                };

                throw new InvalidOperationException(errorMessage, s3Ex);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== GENERAL ERROR ===");
                Console.WriteLine($"Type: {ex.GetType().Name}");
                Console.WriteLine($"Message: {ex.Message}");
                throw;
            }
        }
        public async Task<string> UploadFileAsync(string key, Stream fileStream, string contentType)
        {
            try
            {
                Console.WriteLine($"=== S3 UPLOAD START ===");
                Console.WriteLine($"Bucket: {_bucketName}");
                Console.WriteLine($"Key: {key}");
                Console.WriteLine($"Content Type: {contentType}");
                Console.WriteLine($"Stream Length: {fileStream.Length}");

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = fileStream,
                    ContentType = contentType,
                    ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
                };

                Console.WriteLine("Sending request to S3...");
                var response = await _s3Client.PutObjectAsync(request);

                Console.WriteLine($"S3 Response Status: {response.HttpStatusCode}");
                Console.WriteLine($"S3 ETag: {response.ETag}");
                Console.WriteLine("=== S3 UPLOAD SUCCESS ===");

                return $"https://{_bucketName}.s3.amazonaws.com/{key}";
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.WriteLine("=== S3 SPECIFIC ERROR ===");
                Console.WriteLine($"S3 Error Code: {s3Ex.ErrorCode}");
                Console.WriteLine($"S3 Error Message: {s3Ex.Message}");
                Console.WriteLine($"S3 Status Code: {s3Ex.StatusCode}");
                Console.WriteLine($"S3 Request ID: {s3Ex.RequestId}");

                throw new InvalidOperationException($"S3 Error: {s3Ex.ErrorCode} - {s3Ex.Message}", s3Ex);
            }
            catch (AmazonClientException clientEx)
            {
                Console.WriteLine("=== AWS CLIENT ERROR ===");
                Console.WriteLine($"Client Error: {clientEx.Message}");
                throw new InvalidOperationException($"AWS Client Error: {clientEx.Message}", clientEx);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== GENERAL S3 UPLOAD ERROR ===");
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<Stream> DownloadFileAsync(string key)
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectAsync(request);
            return response.ResponseStream;
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

        public async Task<bool> FileExistsAsync(string key)
        {
            try
            {
                var request = new GetObjectMetadataRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                await _s3Client.GetObjectMetadataAsync(request);
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        public async Task<long> GetFileSizeAsync(string key)
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectMetadataAsync(request);
            return response.ContentLength;
        }

        public async Task CopyFileAsync(string sourceKey, string destinationKey)
        {
            var request = new CopyObjectRequest
            {
                SourceBucket = _bucketName,
                SourceKey = sourceKey,
                DestinationBucket = _bucketName,
                DestinationKey = destinationKey
            };

            await _s3Client.CopyObjectAsync(request);
        }

        public async Task<string> GetFileUrlAsync(string key)
        {
            return await GenerateDownloadUrlAsync(key, 60); // 1 hour expiry
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