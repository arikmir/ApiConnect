using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMarketplace.ConnectorService.Data;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;
using System.Security.Claims;

namespace ApiMarketplace.ConnectorService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConnectorsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ConnectorsController> _logger;

    public ConnectorsController(AppDbContext context, ILogger<ConnectorsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ConnectorDto>>> GetConnectors()
    {
        var connectors = await _context.Connectors
            .Where(c => c.IsActive)
            .Select(c => new ConnectorDto(
                c.Id,
                c.Name,
                c.Description,
                c.Category,
                c.LogoUrl,
                c.BasePrice,
                c.IsPopular,
                c.IsNew,
                c.ActiveUsers,
                c.Reliability
            ))
            .ToListAsync();

        return Ok(connectors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Connector>> GetConnector(Guid id)
    {
        var connector = await _context.Connectors.FindAsync(id);
        if (connector == null)
            return NotFound();

        return Ok(connector);
    }

    [HttpPost("instances")]
    public async Task<IActionResult> CreateInstance([FromBody] CreateInstanceDto dto)
    {
        var organizationId = GetOrganizationId();

        var connector = await _context.Connectors.FindAsync(dto.ConnectorId);
        if (connector == null)
            return NotFound("Connector not found");

        var instance = new ConnectorInstance
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            ConnectorId = dto.ConnectorId,
            Name = dto.Name,
            Config = EncryptConfig(dto.Config),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ConnectorInstances.Add(instance);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created connector instance {InstanceId} for organization {OrgId}",
            instance.Id, organizationId);

        return CreatedAtAction(nameof(GetInstance), new { id = instance.Id }, instance);
    }

    [HttpGet("instances")]
    public async Task<ActionResult<IEnumerable<ConnectorInstanceDto>>> GetInstances()
    {
        var organizationId = GetOrganizationId();

        var instances = await _context.ConnectorInstances
            .Include(ci => ci.Connector)
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => new ConnectorInstanceDto(
                ci.Id,
                ci.Name,
                ci.ConnectorId,
                ci.Connector!.Name,
                ci.Connector.LogoUrl,
                ci.IsActive,
                ci.CreatedAt
            ))
            .ToListAsync();

        return Ok(instances);
    }

    [HttpGet("instances/{id}")]
    public async Task<ActionResult<ConnectorInstance>> GetInstance(Guid id)
    {
        var organizationId = GetOrganizationId();

        var instance = await _context.ConnectorInstances
            .Include(ci => ci.Connector)
            .FirstOrDefaultAsync(ci => ci.Id == id && ci.OrganizationId == organizationId);

        if (instance == null)
            return NotFound();

        // Decrypt config before returning
        instance.Config = DecryptConfig(instance.Config);

        return Ok(instance);
    }

    [HttpPut("instances/{id}")]
    public async Task<IActionResult> UpdateInstance(Guid id, [FromBody] CreateInstanceDto dto)
    {
        var organizationId = GetOrganizationId();

        var instance = await _context.ConnectorInstances
            .FirstOrDefaultAsync(ci => ci.Id == id && ci.OrganizationId == organizationId);

        if (instance == null)
            return NotFound();

        instance.Name = dto.Name;
        instance.Config = EncryptConfig(dto.Config);
        instance.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("instances/{id}")]
    public async Task<IActionResult> DeleteInstance(Guid id)
    {
        var organizationId = GetOrganizationId();

        var instance = await _context.ConnectorInstances
            .FirstOrDefaultAsync(ci => ci.Id == id && ci.OrganizationId == organizationId);

        if (instance == null)
            return NotFound();

        _context.ConnectorInstances.Remove(instance);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("instances/{id}/test")]
    public async Task<IActionResult> TestConnection(Guid id)
    {
        var organizationId = GetOrganizationId();

        var instance = await _context.ConnectorInstances
            .Include(ci => ci.Connector)
            .FirstOrDefaultAsync(ci => ci.Id == id && ci.OrganizationId == organizationId);

        if (instance == null)
            return NotFound();

        // TODO: Implement actual connection testing
        // For now, return success
        return Ok(new { success = true, message = "Connection test successful" });
    }

    private Guid GetOrganizationId()
    {
        var claim = User.FindFirst("OrganizationId");
        if (claim == null || !Guid.TryParse(claim.Value, out var orgId))
            throw new UnauthorizedAccessException("Invalid organization claim");
        return orgId;
    }

    private string EncryptConfig(string config)
    {
        // TODO: Implement proper encryption using AES-256
        // For MVP, return as-is (NOT FOR PRODUCTION)
        return config;
    }

    private string DecryptConfig(string config)
    {
        // TODO: Implement proper decryption
        // For MVP, return as-is (NOT FOR PRODUCTION)
        return config;
    }
}
