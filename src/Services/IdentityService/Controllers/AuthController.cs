using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMarketplace.ConnectorService.Data;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;
using ApiMarketplace.IdentityService.Services;
using BCrypt.Net;

namespace ApiMarketplace.IdentityService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        TokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Email and password are required");

        // Check if user exists
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("User already exists");

        // Create organization
        var organization = new Organization
        {
            Id = Guid.NewGuid(),
            Name = dto.OrganizationName,
            SubscriptionTier = "Starter",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            OrganizationId = organization.Id,
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        _context.Organizations.Add(organization);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New user registered: {Email}, Organization: {OrgName}",
            user.Email, organization.Name);

        var token = _tokenService.GenerateToken(user, organization);
        var userDto = _tokenService.CreateUserDto(user, organization);

        return Ok(new AuthResponse(token, userDto));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Organization)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return Unauthorized("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        _logger.LogInformation("User logged in: {Email}", user.Email);

        var token = _tokenService.GenerateToken(user, user.Organization!);
        var userDto = _tokenService.CreateUserDto(user, user.Organization!);

        return Ok(new AuthResponse(token, userDto));
    }

    [HttpPost("validate")]
    public IActionResult ValidateToken()
    {
        // If the request reaches here, the JWT is valid
        return Ok(new { valid = true });
    }
}
