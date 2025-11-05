using Microsoft.EntityFrameworkCore;
using ApiMarketplace.Shared.Models;

namespace ApiMarketplace.ConnectorService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Connector> Connectors { get; set; }
    public DbSet<ConnectorInstance> ConnectorInstances { get; set; }
    public DbSet<ApiCall> ApiCalls { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Organization)
            .WithMany(o => o.Users)
            .HasForeignKey(u => u.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ConnectorInstance>()
            .HasOne(ci => ci.Organization)
            .WithMany(o => o.ConnectorInstances)
            .HasForeignKey(ci => ci.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ConnectorInstance>()
            .HasOne(ci => ci.Connector)
            .WithMany(c => c.Instances)
            .HasForeignKey(ci => ci.ConnectorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApiCall>()
            .HasOne(ac => ac.ConnectorInstance)
            .WithMany(ci => ci.ApiCalls)
            .HasForeignKey(ac => ac.ConnectorInstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed initial connectors
        modelBuilder.Entity<Connector>().HasData(
            new Connector
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "Stripe",
                Description = "Accept payments and manage subscriptions with the world's leading payment platform",
                Category = "Payments",
                LogoUrl = "/assets/logos/stripe.svg",
                BasePrice = 29.99m,
                IsActive = true,
                IsPopular = true,
                IsNew = false,
                ActiveUsers = 12500,
                Reliability = 99.99m,
                CreatedAt = DateTime.UtcNow,
                ConfigSchema = @"{
                    ""apiKey"": { ""type"": ""string"", ""required"": true, ""label"": ""API Secret Key"" },
                    ""webhookSecret"": { ""type"": ""string"", ""required"": false, ""label"": ""Webhook Secret"" }
                }"
            },
            new Connector
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "SendGrid",
                Description = "Email delivery service for transactional and marketing emails",
                Category = "Communication",
                LogoUrl = "/assets/logos/sendgrid.svg",
                BasePrice = 19.99m,
                IsActive = true,
                IsPopular = true,
                IsNew = false,
                ActiveUsers = 8900,
                Reliability = 99.95m,
                CreatedAt = DateTime.UtcNow,
                ConfigSchema = @"{
                    ""apiKey"": { ""type"": ""string"", ""required"": true, ""label"": ""API Key"" },
                    ""fromEmail"": { ""type"": ""string"", ""required"": true, ""label"": ""Default From Email"" },
                    ""fromName"": { ""type"": ""string"", ""required"": false, ""label"": ""Default From Name"" }
                }"
            },
            new Connector
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Slack",
                Description = "Team communication and collaboration platform integration",
                Category = "Communication",
                LogoUrl = "/assets/logos/slack.svg",
                BasePrice = 15.99m,
                IsActive = true,
                IsPopular = true,
                IsNew = false,
                ActiveUsers = 15200,
                Reliability = 99.97m,
                CreatedAt = DateTime.UtcNow,
                ConfigSchema = @"{
                    ""webhookUrl"": { ""type"": ""string"", ""required"": true, ""label"": ""Webhook URL"" },
                    ""botToken"": { ""type"": ""string"", ""required"": false, ""label"": ""Bot Token"" }
                }"
            },
            new Connector
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Name = "Australia Post",
                Description = "Shipping, tracking, and delivery services for Australian businesses",
                Category = "Shipping",
                LogoUrl = "/assets/logos/auspost.svg",
                BasePrice = 24.99m,
                IsActive = true,
                IsPopular = false,
                IsNew = true,
                ActiveUsers = 3400,
                Reliability = 99.8m,
                CreatedAt = DateTime.UtcNow,
                ConfigSchema = @"{
                    ""apiKey"": { ""type"": ""string"", ""required"": true, ""label"": ""API Key"" },
                    ""accountNumber"": { ""type"": ""string"", ""required"": true, ""label"": ""Account Number"" }
                }"
            },
            new Connector
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Name = "Xero",
                Description = "Cloud accounting software for small and medium businesses",
                Category = "Accounting",
                LogoUrl = "/assets/logos/xero.svg",
                BasePrice = 34.99m,
                IsActive = true,
                IsPopular = true,
                IsNew = false,
                ActiveUsers = 6700,
                Reliability = 99.9m,
                CreatedAt = DateTime.UtcNow,
                ConfigSchema = @"{
                    ""clientId"": { ""type"": ""string"", ""required"": true, ""label"": ""Client ID"" },
                    ""clientSecret"": { ""type"": ""string"", ""required"": true, ""label"": ""Client Secret"" },
                    ""tenantId"": { ""type"": ""string"", ""required"": true, ""label"": ""Tenant ID"" }
                }"
            }
        );
    }
}
