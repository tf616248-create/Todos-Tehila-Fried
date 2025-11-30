//using Microsoft.EntityFrameworkCore;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.IdentityModel.Tokens;
//using System.Text;
//using TodoApi;

//var builder = WebApplication.CreateBuilder(args);

//// --- DB ---
//builder.Services.AddDbContext<ToDoDbContext>(options =>
//    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
//        new MySqlServerVersion(new Version(8, 0, 44)))
//);

//// --- CORS ---
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAll", policy =>
//        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
//              .AllowAnyHeader()
//              .AllowAnyMethod()
//              .AllowCredentials());
//});

//// --- Swagger ---
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//// --- JWT Authentication ---
//var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//})
//.AddJwtBearer(options =>
//{
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuer = false,
//        ValidateAudience = false,
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(key)
//    };
//});

//// --- Authorization ---
//builder.Services.AddAuthorization();

//var app = builder.Build();

//app.UseCors("AllowAll");
//app.UseAuthentication();
//app.UseAuthorization();

//// --- Swagger middleware ---
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI(c =>
//    {
//        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo API v1");
//    });
//}

//// --- Root route ---

//// app.MapGet("/", () => "API is running!");

//// --- CRUD Items ---
//app.MapGet("/api/items", [Microsoft.AspNetCore.Authorization.Authorize] async (ToDoDbContext db) =>
//    await db.Items.ToListAsync());

//app.MapGet("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, ToDoDbContext db) =>
//    await db.Items.FindAsync(id) is Item item ? Results.Ok(item) : Results.NotFound());

//app.MapPost("/api/items", [Microsoft.AspNetCore.Authorization.Authorize] async (Item item, ToDoDbContext db) =>
//{
//    db.Items.Add(item);
//    await db.SaveChangesAsync();
//    return Results.Created($"/api/items/{item.Id}", item);
//});

//app.MapPut("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, Item inputItem, ToDoDbContext db) =>
//{
//    var item = await db.Items.FindAsync(id);
//    if (item is null) return Results.NotFound();

//    item.Name = inputItem.Name;
//    item.IsComplete = inputItem.IsComplete;
//    await db.SaveChangesAsync();
//    return Results.NoContent();
//});

//app.MapDelete("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, ToDoDbContext db) =>
//{
//    var item = await db.Items.FindAsync(id);
//    if (item is null) return Results.NotFound();

//    db.Items.Remove(item);
//    await db.SaveChangesAsync();
//    return Results.NoContent();
//});

//// --- Users registration ---
//app.MapPost("/api/users/register", async (User user, ToDoDbContext db, ILogger<Program> logger) =>
//{
//    try
//    {
//        logger.LogInformation("Register attempt for user: {Username}", user.Username);

//        // בדיקה אם המשתמש כבר קיים
//        if (await db.Users.AnyAsync(u => u.Username == user.Username))
//        {
//            logger.LogWarning("Username already exists: {Username}", user.Username);
//            return Results.BadRequest(new { message = "שם המשתמש כבר קיים במערכת" });
//        }

//        // הצפנת הסיסמה
//        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

//        // שמירת המשתמש במסד הנתונים
//        db.Users.Add(user);
//        await db.SaveChangesAsync();

//        logger.LogInformation("User registered successfully: {Username}", user.Username);
//        return Results.Ok(new { message = "המשתמש נוצר בהצלחה" });
//    }
//    catch (Exception ex)
//    {
//        logger.LogError(ex, "Error during registration for user: {Username}", user?.Username ?? "unknown");
//        return Results.Problem("אירעה שגיאה בעת יצירת המשתמש");
//    }
//});

//// התחברות משתמש קיים
//app.MapPost("/api/users/login", async (User user, ToDoDbContext db, ILogger<Program> logger) =>
//{
//    try 
//    {
//        logger.LogInformation("Login attempt for user: {Username}", user.Username);

//        var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);

//        if (dbUser is null)
//        {
//            logger.LogWarning("User not found: {Username}", user.Username);
//            return Results.Unauthorized();
//        }

//        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(user.Password, dbUser.Password);

//        if (!isPasswordValid)
//        {
//            logger.LogWarning("Invalid password for user: {Username}", user.Username);
//            return Results.Unauthorized();
//        }

//        logger.LogInformation("User {Username} authenticated successfully", user.Username);

//        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
//        var key = builder.Configuration["Jwt:Key"];

//        if (string.IsNullOrEmpty(key))
//        {
//            logger.LogError("JWT Key is not configured");
//            return Results.StatusCode(500);
//        }

//        var keyBytes = Encoding.ASCII.GetBytes(key);
//        var tokenDescriptor = new SecurityTokenDescriptor
//        {
//            Subject = new System.Security.Claims.ClaimsIdentity(new[]
//            {
//                new System.Security.Claims.Claim("id", dbUser.Id.ToString())
//            }),
//            Expires = DateTime.UtcNow.AddHours(2),
//            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
//        };

//        var token = tokenHandler.CreateToken(tokenDescriptor);
//        return Results.Ok(new { token = tokenHandler.WriteToken(token) });
//    }
//    catch (Exception ex)
//    {
//        logger.LogError(ex, "Error during login for user: {Username}", user?.Username ?? "unknown");
//        return Results.StatusCode(500);
//    }
//});
//app.MapPatch("/api/items/{id}", async (int id, Item updatedItem, ToDoDbContext db) =>
//{
//    var item = await db.Items.FindAsync(id);
//    if (item is null) return Results.NotFound();

//    item.IsComplete = updatedItem.IsComplete;
//    await db.SaveChangesAsync();
//    return Results.NoContent();
//});
//app.Run();

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TodoApi;

var builder = WebApplication.CreateBuilder(args);

// --- DB ---
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("ToDoDB"),
        new MySqlServerVersion(new Version(8, 0, 44)))
);

// --- CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// --- Swagger ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- JWT Authentication ---
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
    throw new Exception("❌ JWT Key not found in configuration!");

var keyBytes = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// --- Swagger middleware ---
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Todo API v1");
    });
//}

// --- פונקציה לשליפת UserId מה-JWT ---
int GetUserIdFromClaims(HttpContext httpContext)
{
    var userIdClaim = httpContext.User.Claims.FirstOrDefault(c => c.Type == "id");
    return userIdClaim is not null ? int.Parse(userIdClaim.Value) : 0;
}

// --- CRUD Routes ---
// שליפת כל המשימות של המשתמש
app.MapGet("/api/items", [Microsoft.AspNetCore.Authorization.Authorize] async (HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    var tasks = await db.Items.Where(i => i.UserId == userId).ToListAsync();
    return Results.Ok(tasks);
});

// שליפת משימה לפי Id
app.MapGet("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    var item = await db.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    return item is not null ? Results.Ok(item) : Results.NotFound();
});

// יצירת משימה חדשה
app.MapPost("/api/items", [Microsoft.AspNetCore.Authorization.Authorize] async (Item item, HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    item.UserId = userId;
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/api/items/{item.Id}", item);
});

// עדכון משימה קיימת
app.MapPut("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, Item inputItem, HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    var item = await db.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    if (item is null) return Results.NotFound();

    item.Name = inputItem.Name;
    item.IsComplete = inputItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// עדכון חלקי של משימה (PATCH)
app.MapPatch("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, Item updatedItem, HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    var item = await db.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    if (item is null) return Results.NotFound();

    item.IsComplete = updatedItem.IsComplete;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// מחיקת משימה
app.MapDelete("/api/items/{id}", [Microsoft.AspNetCore.Authorization.Authorize] async (int id, HttpContext http, ToDoDbContext db) =>
{
    var userId = GetUserIdFromClaims(http);
    var item = await db.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    if (item is null) return Results.NotFound();

    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// --- Users Registration ---
app.MapPost("/api/users/register", async (User user, ToDoDbContext db, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Register attempt for user: {Username}", user.Username);

        if (await db.Users.AnyAsync(u => u.Username == user.Username))
            return Results.BadRequest(new { message = "שם המשתמש כבר קיים" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "המשתמש נוצר בהצלחה" });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error during registration");
        return Results.Problem("שגיאה בעת יצירת המשתמש");
    }
});

// --- User Login ---
app.MapPost("/api/users/login", async (User user, ToDoDbContext db, ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Login attempt for user: {Username}", user.Username);

        var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
        if (dbUser is null) return Results.Unauthorized();

        bool valid = BCrypt.Net.BCrypt.Verify(user.Password, dbUser.Password);
        if (!valid) return Results.Unauthorized();

        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("id", dbUser.Id.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Results.Ok(new { token = tokenHandler.WriteToken(token) });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error during login");
        return Results.StatusCode(500);
    }
});
app.MapGet("/", () => "ToDos API is running!🤌🤌🤌⏳⌛⏳");
app.Run();
