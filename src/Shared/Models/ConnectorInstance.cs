namespace ApiMarketplace.Shared.Models;

public class ConnectorInstance
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid ConnectorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Config { get; set; } = "{}";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Organization? Organization { get; set; }
    public Connector? Connector { get; set; }
    public List<ApiCall> ApiCalls { get; set; } = new();
}
