using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMarketplace.ConnectorService.Data;

namespace ApiMarketplace.MonitoringService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MetricsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<MetricsController> _logger;

    public MetricsController(AppDbContext context, ILogger<MetricsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var organizationId = GetOrganizationId();

        var instanceIds = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => ci.Id)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var twoWeeksAgo = now.AddDays(-14);

        var thisWeekCalls = await _context.ApiCalls
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) && ac.CreatedAt >= weekAgo)
            .CountAsync();

        var lastWeekCalls = await _context.ApiCalls
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) &&
                        ac.CreatedAt >= twoWeeksAgo && ac.CreatedAt < weekAgo)
            .CountAsync();

        var activeConnectors = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId && ci.IsActive)
            .CountAsync();

        var totalErrors = await _context.ApiCalls
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) &&
                        ac.CreatedAt >= weekAgo && ac.StatusCode >= 400)
            .CountAsync();

        var avgResponseTime = await _context.ApiCalls
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) && ac.CreatedAt >= weekAgo)
            .AverageAsync(ac => (double?)ac.ResponseTimeMs) ?? 0;

        var callsChange = lastWeekCalls > 0
            ? ((thisWeekCalls - lastWeekCalls) / (double)lastWeekCalls) * 100
            : 0;

        var errorRate = thisWeekCalls > 0
            ? (totalErrors / (double)thisWeekCalls) * 100
            : 0;

        return Ok(new
        {
            totalCalls = thisWeekCalls,
            callsChange = Math.Round(callsChange, 1),
            activeConnectors,
            errorRate = Math.Round(errorRate, 2),
            avgResponseTime = Math.Round(avgResponseTime, 0)
        });
    }

    [HttpGet("usage")]
    public async Task<IActionResult> GetUsageData([FromQuery] int days = 7)
    {
        var organizationId = GetOrganizationId();

        var instanceIds = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => ci.Id)
            .ToListAsync();

        var startDate = DateTime.UtcNow.AddDays(-days).Date;

        var usage = await _context.ApiCalls
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) && ac.CreatedAt >= startDate)
            .GroupBy(ac => ac.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key.ToString("yyyy-MM-dd"),
                calls = g.Count()
            })
            .OrderBy(x => x.date)
            .ToListAsync();

        return Ok(usage);
    }

    [HttpGet("activity")]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 20)
    {
        var organizationId = GetOrganizationId();

        var instanceIds = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => ci.Id)
            .ToListAsync();

        var activities = await _context.ApiCalls
            .Include(ac => ac.ConnectorInstance)
                .ThenInclude(ci => ci!.Connector)
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId))
            .OrderByDescending(ac => ac.CreatedAt)
            .Take(limit)
            .Select(ac => new
            {
                id = ac.Id,
                title = $"{ac.Method} {ac.Endpoint}",
                description = ac.ConnectorInstance!.Name,
                status = ac.StatusCode >= 400 ? "error" : ac.StatusCode >= 300 ? "warning" : "success",
                timestamp = ac.CreatedAt,
                connectorLogo = ac.ConnectorInstance.Connector!.LogoUrl,
                connectorName = ac.ConnectorInstance.Connector.Name,
                responseTime = ac.ResponseTimeMs
            })
            .ToListAsync();

        return Ok(activities);
    }

    [HttpGet("errors")]
    public async Task<IActionResult> GetErrors([FromQuery] int limit = 50)
    {
        var organizationId = GetOrganizationId();

        var instanceIds = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => ci.Id)
            .ToListAsync();

        var errors = await _context.ApiCalls
            .Include(ac => ac.ConnectorInstance)
                .ThenInclude(ci => ci!.Connector)
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) && ac.StatusCode >= 400)
            .OrderByDescending(ac => ac.CreatedAt)
            .Take(limit)
            .Select(ac => new
            {
                id = ac.Id,
                endpoint = ac.Endpoint,
                method = ac.Method,
                statusCode = ac.StatusCode,
                errorMessage = ac.ErrorMessage,
                timestamp = ac.CreatedAt,
                connectorName = ac.ConnectorInstance!.Connector!.Name,
                instanceName = ac.ConnectorInstance.Name
            })
            .ToListAsync();

        return Ok(errors);
    }

    [HttpGet("performance")]
    public async Task<IActionResult> GetPerformance([FromQuery] int days = 7)
    {
        var organizationId = GetOrganizationId();

        var instanceIds = await _context.ConnectorInstances
            .Where(ci => ci.OrganizationId == organizationId)
            .Select(ci => ci.Id)
            .ToListAsync();

        var startDate = DateTime.UtcNow.AddDays(-days);

        var performance = await _context.ApiCalls
            .Include(ac => ac.ConnectorInstance)
                .ThenInclude(ci => ci!.Connector)
            .Where(ac => instanceIds.Contains(ac.ConnectorInstanceId) && ac.CreatedAt >= startDate)
            .GroupBy(ac => ac.ConnectorInstance!.Connector!.Name)
            .Select(g => new
            {
                connector = g.Key,
                avgResponseTime = g.Average(ac => ac.ResponseTimeMs),
                totalCalls = g.Count(),
                errorCount = g.Count(ac => ac.StatusCode >= 400),
                successRate = (g.Count(ac => ac.StatusCode < 400) / (double)g.Count()) * 100
            })
            .ToListAsync();

        return Ok(performance);
    }

    private Guid GetOrganizationId()
    {
        var claim = User.FindFirst("OrganizationId");
        if (claim == null || !Guid.TryParse(claim.Value, out var orgId))
            throw new UnauthorizedAccessException("Invalid organization claim");
        return orgId;
    }
}
