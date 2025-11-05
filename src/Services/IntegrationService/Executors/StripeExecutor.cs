using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;

namespace ApiMarketplace.IntegrationService.Executors;

public class StripeExecutor : IConnectorExecutor
{
    public string ConnectorName => "Stripe";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<StripeExecutor> _logger;

    public StripeExecutor(IHttpClientFactory httpClientFactory, ILogger<StripeExecutor> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request)
    {
        var config = JsonSerializer.Deserialize<StripeConfig>(instance.Config);
        if (config == null || string.IsNullOrEmpty(config.ApiKey))
            throw new InvalidOperationException("Invalid Stripe configuration");

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config.ApiKey);

        var httpRequest = new HttpRequestMessage
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri($"https://api.stripe.com/v1/{request.Endpoint.TrimStart('/')}")
        };

        if (!string.IsNullOrEmpty(request.Body))
        {
            httpRequest.Content = new StringContent(request.Body, Encoding.UTF8, "application/json");
        }

        // Add custom headers
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

        _logger.LogInformation("Stripe API call to {Endpoint} completed in {Ms}ms with status {Status}",
            request.Endpoint, stopwatch.ElapsedMilliseconds, response.StatusCode);

        return new ApiResponse(
            (int)response.StatusCode,
            responseBody,
            response.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value)),
            (int)stopwatch.ElapsedMilliseconds,
            response.IsSuccessStatusCode ? null : responseBody
        );
    }

    private class StripeConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string? WebhookSecret { get; set; }
    }
}
