using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMarketplace.ConnectorService.Data;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;
using ApiMarketplace.IntegrationService.Executors;
using Polly;
using Polly.Retry;

namespace ApiMarketplace.IntegrationService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExecuteController : ControllerBase
{
    private readonly Dictionary<string, IConnectorExecutor> _executors;
    private readonly AppDbContext _context;
    private readonly ILogger<ExecuteController> _logger;
    private readonly AsyncRetryPolicy<ApiResponse> _retryPolicy;

    public ExecuteController(
        IEnumerable<IConnectorExecutor> executors,
        AppDbContext context,
        ILogger<ExecuteController> logger)
    {
        _executors = executors.ToDictionary(e => e.ConnectorName);
        _context = context;
        _logger = logger;

        // Configure Polly retry policy
        _retryPolicy = Policy<ApiResponse>
            .HandleResult(r => r.StatusCode >= 500)
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    _logger.LogWarning(
                        "Retry {RetryCount} after {Seconds}s due to status code {StatusCode}",
                        retryCount, timespan.TotalSeconds, outcome.Result.StatusCode);
                });
    }

    [HttpPost("{instanceId}")]
    public async Task<ActionResult<ApiResponse>> Execute(Guid instanceId, [FromBody] ApiRequest request)
    {
        var organizationId = GetOrganizationId();

        var instance = await _context.ConnectorInstances
            .Include(ci => ci.Connector)
            .FirstOrDefaultAsync(ci => ci.Id == instanceId && ci.OrganizationId == organizationId);

        if (instance == null)
            return NotFound("Connector instance not found");

        if (!instance.IsActive)
            return BadRequest("Connector instance is not active");

        if (!_executors.TryGetValue(instance.Connector!.Name, out var executor))
            return BadRequest($"No executor found for {instance.Connector.Name}");

        ApiResponse response;
        try
        {
            // Execute with retry policy
            response = await _retryPolicy.ExecuteAsync(async () =>
                await executor.ExecuteAsync(instance, request));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing connector {ConnectorName}", instance.Connector.Name);
            response = new ApiResponse(
                500,
                "{\"error\": \"Internal server error\"}",
                new Dictionary<string, string>(),
                0,
                ex.Message
            );
        }

        // Log the API call
        var apiCall = new ApiCall
        {
            Id = Guid.NewGuid(),
            ConnectorInstanceId = instanceId,
            Endpoint = request.Endpoint,
            Method = request.Method,
            StatusCode = response.StatusCode,
            ResponseTimeMs = response.ResponseTimeMs,
            ErrorMessage = response.ErrorMessage,
            CreatedAt = DateTime.UtcNow
        };

        _context.ApiCalls.Add(apiCall);
        await _context.SaveChangesAsync();

        return Ok(response);
    }

    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            executors = _executors.Keys,
            timestamp = DateTime.UtcNow
        });
    }

    private Guid GetOrganizationId()
    {
        var claim = User.FindFirst("OrganizationId");
        if (claim == null || !Guid.TryParse(claim.Value, out var orgId))
            throw new UnauthorizedAccessException("Invalid organization claim");
        return orgId;
    }
}
