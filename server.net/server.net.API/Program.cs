using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.net.Service.Services;
using System.Threading.RateLimiting;
using server.net.Core.Interfaces.Repositories;
using server.net.Core.Interfaces.Services;
using server.net.Data;
using server.net.Data.Repositories;
using server.net.API.Middleware;
using Microsoft.OpenApi.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configuration debugging
Console.WriteLine("🔍 Checking configuration files...");
Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");

// Check if appsettings.json exists
var appSettingsPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
if (File.Exists(appSettingsPath))
{
    Console.WriteLine("✅ appsettings.json found");
}
else
{
    Console.WriteLine("❌ appsettings.json not found");
}

// Port configuration for Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");

// Controllers with JSON configuration for camelCase
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use camelCase
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;

        // Additional JSON options for better compatibility
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.WriteIndented = builder.Environment.IsDevelopment();

        // Handle enum serialization
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });

// Basic services
// builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// Swagger (development only)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "FileKeeper API",
            Version = "v1",
            Description = "מערכת ניהול קבצים מתקדמת"
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = ParameterLocation.Header,
                },
                new List<string>()
            }
        });
    });
}

// CORS - using appsettings configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Rate Limiting - using appsettings configuration
var rateLimitConfig = builder.Configuration.GetSection("RateLimit");
var permitLimit = rateLimitConfig.GetValue<int>("PermitLimit", 100);
var windowMinutes = rateLimitConfig.GetValue<int>("WindowMinutes", 1);

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        context => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(windowMinutes),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));
});

// JWT Authentication - using appsettings configuration
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["JwtSettings:Secret"]
    ?? "super-secret-jwt-key-for-filekeeper-that-is-at-least-32-characters-long";

var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "FileKeeper";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "FileKeeper.Client";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
});

// Health Checks - using appsettings configuration
if (builder.Configuration.GetValue<bool>("HealthChecks:Enabled", true))
{
    builder.Services.AddHealthChecks()
        .AddCheck("database", () =>
        {
            var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? builder.Configuration.GetConnectionString("DefaultConnection");

            return !string.IsNullOrEmpty(connectionString)
                ? Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy()
                : Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy("No database connection");
        });
}

// Dependency Injection
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();
builder.Services.AddScoped<IS3StorageService, S3StorageService>();

// Database connection string - Updated for Transaction Pooler
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine($"🔗 Connection string source: {(Environment.GetEnvironmentVariable("DATABASE_URL") != null ? "Environment" : "appsettings.json")}");
Console.WriteLine($"🔗 Connection string preview: {connectionString?.Substring(0, Math.Min(50, connectionString?.Length ?? 0))}...");

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseNpgsql(connectionString, npgsql =>
    {
        // Remove retry strategy to avoid transaction conflicts
        // npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(30), null);
        npgsql.CommandTimeout(60);
    });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

var app = builder.Build();

// Database setup with better error handling
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<DataContext>();

        Console.WriteLine("🔄 Testing database connection...");
        await context.Database.CanConnectAsync();
        Console.WriteLine("✅ Database connection successful!");

        Console.WriteLine("🔄 Applying migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("✅ Database migrations applied!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database error: {ex.Message}");
        Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");

        // Don't exit the application, just log the error
        Console.WriteLine("⚠️ Application will continue without database...");
    }
}

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FileKeeper API"));
}

if (builder.Configuration.GetValue<bool>("Security:RequireHttps", false))
{
    app.UseHttpsRedirection();
}

if (builder.Configuration.GetValue<bool>("Security:EnableHSTS", false))
{
    app.UseHsts();
}

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ErrorHandlingMiddleware>();

// Endpoints
app.MapControllers();

if (builder.Configuration.GetValue<bool>("HealthChecks:Enabled", true))
{
    app.MapHealthChecks("/health");
}

app.MapGet("/", () => new {
    status = "FileKeeper API",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow
});

Console.WriteLine($"🚀 FileKeeper API running on port {port}");
if (app.Environment.IsDevelopment())
{
    Console.WriteLine($"📚 Swagger: http://localhost:{port}/swagger");
}

app.Run();
