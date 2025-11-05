namespace ApiMarketplace.Shared.Models;

public class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = "Starter";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<User> Users { get; set; } = new();
    public List<ConnectorInstance> ConnectorInstances { get; set; } = new();
}
