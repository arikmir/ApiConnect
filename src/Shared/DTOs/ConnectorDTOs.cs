namespace ApiMarketplace.Shared.DTOs;

public record ConnectorDto(
    Guid Id,
    string Name,
    string Description,
    string Category,
    string LogoUrl,
    decimal BasePrice,
    bool IsPopular,
    bool IsNew,
    int ActiveUsers,
    decimal Reliability
);

public record CreateInstanceDto(
    Guid ConnectorId,
    string Name,
    string Config
);

public record ConnectorInstanceDto(
    Guid Id,
    string Name,
    Guid ConnectorId,
    string ConnectorName,
    string ConnectorLogo,
    bool IsActive,
    DateTime CreatedAt
);

public record ApiRequest(
    string Endpoint,
    string Method,
    string? Body,
    Dictionary<string, string>? Headers
);

public record ApiResponse(
    int StatusCode,
    string Body,
    Dictionary<string, string> Headers,
    int ResponseTimeMs,
    string? ErrorMessage = null
);
