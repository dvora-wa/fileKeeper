using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

using FileKeeper_server_.net.Core.Interfaces.Repositories;
using FileKeeper_server_.net.Core.Interfaces.Services;
using FileKeeper_server_.net.API.Middleware;
using FileKeeper_server_.net.Data;
using FileKeeper_server_.net.Data.Repositories;
using FileKeeper_server_.net.Service.Services;
using System.Threading.RateLimiting;

//var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for HTTP only
//builder.WebHost.ConfigureKestrel(serverOptions =>
//{
//    serverOptions.ConfigureEndpointDefaults(configure =>
//        configure.Protocols = Microsoft.AspNetCore.Server.Kestrel.Core.HttpProtocols.Http1);
//    serverOptions.ListenLocalhost(5000);
//});

// Basic Services
//builder.Services.AddControllers()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
//        options.JsonSerializerOptions.WriteIndented = true; // יותר קריא בפיתוח
//    });
//builder.Services.AddEndpointsApiExplorer();

//// Database with enhanced retry policy


//// JWT Configuration
//var jwtSecret = builder.Configuration["JwtSettings:Secret"]
//    ?? throw new InvalidOperationException("JWT Secret is not configured");

//// Authentication
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
//            ValidateIssuer = false,
//            ValidateAudience = false,
//            ClockSkew = TimeSpan.Zero // מדויק יותר לתוקף הטוקן
//        };
//    });

//// CORS with more specific configuration

//// DI Registration


//// Rate Limiting


//// Swagger with authentication
////builder.Services.AddSwaggerGen(options =>
////{
////    options.SwaggerDoc("v1", new OpenApiInfo
////    {
////        Version = "v1",
////        Title = "FileKeeper API",
////        Description = "API for managing files and folders",
////        Contact = new OpenApiContact
////        {
////            Name = "dvora-wa",
////            Email = "your-email@domain.com"
////        }
////    });

////    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
////    {
////        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
////        Name = "Authorization",
////        In = ParameterLocation.Header,
////        Type = SecuritySchemeType.ApiKey,
////        Scheme = "Bearer"
////    });

////    options.AddSecurityRequirement(new OpenApiSecurityRequirement
////    {
////        {
////            new OpenApiSecurityScheme
////            {
////                Reference = new OpenApiReference
////                {
////                    Type = ReferenceType.SecurityScheme,
////                    Id = "Bearer"
////                }
////            },
////            Array.Empty<string>()
////        }
////    });
////});

//var app = builder.Build();

//// Database initialization and migration
////using (var scope = app.Services.CreateScope())
////{
////    var services = scope.ServiceProvider;
////    try
////    {
////        var context = services.GetRequiredService<DataContext>();
////        await context.Database.MigrateAsync();
////    }
////    catch (Exception ex)
////    {
////        var logger = services.GetRequiredService<ILogger<Program>>();
////        logger.LogError(ex, "An error occurred while migrating the database.");
////        throw;
////    }
////}

//// Middleware
//if (app.Environment.IsDevelopment())
//{
//   // app.UseSwagger();
//    //app.UseSwaggerUI(c =>
//    //{
//    //    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FileKeeper API V1");
//    //    c.RoutePrefix = string.Empty; // שם את Swagger בשורש
//    //});
//}

////app.UseRateLimiter();
//app.UseCors();
//app.UseAuthentication();
//app.UseAuthorization();
//app.MapControllers();

//app.Run();

//--------------------------------------------------good-----------------------------


//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.

//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
////builder.Services.AddSwaggerGen();
////-------------------------------------------------------
//// Swagger configuration with Authorization
//builder.Services.AddSwaggerGen(options =>
//{
//    options.SwaggerDoc("v1", new OpenApiInfo
//    {
//        Title = "FileKeeper API",
//        Version = "v1"
//    });

//    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//    {
//        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
//        Name = "Authorization",
//        In = ParameterLocation.Header,
//        Type = SecuritySchemeType.ApiKey,
//        Scheme = "Bearer"
//    });

//    options.AddSecurityRequirement(new OpenApiSecurityRequirement
//    {
//        {
//            new OpenApiSecurityScheme
//            {
//                Reference = new OpenApiReference
//                {
//                    Type = ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            Array.Empty<string>()
//        }
//    });
//});

//// הוספת JWT Authentication
//var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured");
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
//            ValidateIssuer = false,
//            ValidateAudience = false
//        };
//    });

////-------------------------------------------------------------------

//builder.Services.AddScoped<IUserRepository, UserRepository>();
//builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
//builder.Services.AddScoped<IUserService, UserService>();
//builder.Services.AddScoped<IFileSystemService, FileSystemService>();
//builder.Services.AddCors(options =>
//options.AddDefaultPolicy(builder =>
//   builder
//          .WithOrigins("http://localhost:5173")/*.AllowAnyOrigin()*/
//          .AllowAnyMethod()
//          .AllowAnyHeader()
//          .WithExposedHeaders("Content-Disposition"))); // נחוץ להורדת קבצים
//builder.Services.AddDbContext<DataContext>(options =>
//options.UseNpgsql(
//builder.Configuration.GetConnectionString("DefaultConnection"),
//npgsqlOptions =>
//{
//npgsqlOptions.EnableRetryOnFailure(
// maxRetryCount: 5,
// maxRetryDelay: TimeSpan.FromSeconds(30),
// errorCodesToAdd: null);
//npgsqlOptions.CommandTimeout(30);
//}));
//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();
//app.UseCors();
//app.UseAuthentication();
//app.UseAuthorization();
//app.UseMiddleware<ErrorHandlingMiddleware>();

//app.MapControllers();

//app.Run();


//--------------------------------------------------good-----------------------------
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger configuration with Authorization
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FileKeeper API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Authentication configuration
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ??
    throw new InvalidOperationException("JWT Secret is not configured");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Register Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();
// Updated CORS configuration
builder.Services.AddCors(options =>
{
    //options.AddDefaultPolicy(corsBuilder =>
    //{
    //    // קודם נקבל את ה-origins מה-configuration
    //    //var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
    //    //    new[]
    //    //    {
    //    //        "http://localhost:5173",    // React Dev
    //    //        "http://localhost:4200",    // Angular Dev
    //    //        "https://filekeeper-client.onrender.com",  // React Prod
    //    //        "https://filekeeper-admin.onrender.com"    // Angular Prod
    //    //    };

    //    // עכשיו נשתמש ב-origins בהגדרות ה-CORS
    //    //corsBuilder
    //    //    .WithOrigins(allowedOrigins)
    //    //    .AllowAnyMethod()
    //    //    .AllowAnyHeader()
    //    //    .AllowCredentials()
    //    //    .WithExposedHeaders("Content-Disposition")
    //    //    .SetPreflightMaxAge(TimeSpan.FromMinutes(10));


    //});
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder
                .AllowAnyOrigin()  // בהתחלה, אחר כך תגביל לדומיינים ספציפיים
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
    });
});

// Database Configuration
builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorCodesToAdd: null);
            npgsqlOptions.CommandTimeout(30);
        }));

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FileKeeper API V1");
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapControllers();

app.Run();
