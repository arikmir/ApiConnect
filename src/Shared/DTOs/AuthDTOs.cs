namespace ApiMarketplace.Shared.DTOs;

public record RegisterDto(string Email, string Password, string OrganizationName);

public record LoginDto(string Email, string Password);

public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string Email, string Role, Guid OrganizationId, string OrganizationName);
