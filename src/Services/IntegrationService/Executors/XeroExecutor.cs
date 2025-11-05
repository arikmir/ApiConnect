using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;

namespace ApiMarketplace.IntegrationService.Executors;

public class XeroExecutor : IConnectorExecutor
{
    public string ConnectorName => "Xero";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<XeroExecutor> _logger;

    public XeroExecutor(IHttpClientFactory httpClientFactory, ILogger<XeroExecutor> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request)
    {
        var config = JsonSerializer.Deserialize<XeroConfig>(instance.Config);
        if (config == null || string.IsNullOrEmpty(config.ClientId))
            throw new InvalidOperationException("Invalid Xero configuration");

        var client = _httpClientFactory.CreateClient();

        // Note: In production, you would need to implement OAuth2 flow
        // and use access tokens. This is a simplified version.
        client.DefaultRequestHeaders.Add("xero-tenant-id", config.TenantId);

        var httpRequest = new HttpRequestMessage
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri($"https://api.xero.com/api.xro/2.0/{request.Endpoint.TrimStart('/')}")
        };

        if (!string.IsNullOrEmpty(request.Body))
        {
            httpRequest.Content = new StringContent(request.Body, Encoding.UTF8, "application/json");
        }

        if (request.Headers != null)
        {
            foreach (var header in request.Headers)
            {
                httpRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
        }

        var stopwatch = Stopwatch.StartNew();
        var response = await client.SendAsync(httpRequest);
        stopwatch.Stop();

        var responseBody = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("Xero API call to {Endpoint} completed in {Ms}ms",
            request.Endpoint, stopwatch.ElapsedMilliseconds);

        return new ApiResponse(
            (int)response.StatusCode,
            responseBody,
            response.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value)),
            (int)stopwatch.ElapsedMilliseconds,
            response.IsSuccessStatusCode ? null : responseBody
        );
    }

    private class XeroConfig
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
    }
}
