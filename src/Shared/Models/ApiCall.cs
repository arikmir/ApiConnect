namespace ApiMarketplace.Shared.Models;

public class ApiCall
{
    public Guid Id { get; set; }
    public Guid ConnectorInstanceId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public int ResponseTimeMs { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public ConnectorInstance? ConnectorInstance { get; set; }
}
