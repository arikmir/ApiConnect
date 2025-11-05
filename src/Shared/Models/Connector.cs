namespace ApiMarketplace.Shared.Models;

public class Connector
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string ConfigSchema { get; set; } = "{}";
    public bool IsActive { get; set; } = true;
    public bool IsPopular { get; set; }
    public bool IsNew { get; set; }
    public int ActiveUsers { get; set; }
    public decimal Reliability { get; set; } = 99.9m;
    public DateTime CreatedAt { get; set; }
    public List<ConnectorInstance> Instances { get; set; } = new();
}
