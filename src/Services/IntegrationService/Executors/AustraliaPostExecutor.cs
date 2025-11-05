using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;

namespace ApiMarketplace.IntegrationService.Executors;

public class AustraliaPostExecutor : IConnectorExecutor
{
    public string ConnectorName => "Australia Post";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AustraliaPostExecutor> _logger;

    public AustraliaPostExecutor(IHttpClientFactory httpClientFactory, ILogger<AustraliaPostExecutor> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request)
    {
        var config = JsonSerializer.Deserialize<AustraliaPostConfig>(instance.Config);
        if (config == null || string.IsNullOrEmpty(config.ApiKey))
            throw new InvalidOperationException("Invalid Australia Post configuration");

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("AUTH-KEY", config.ApiKey);
        client.DefaultRequestHeaders.Add("Account-Number", config.AccountNumber);

        var httpRequest = new HttpRequestMessage
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri($"https://digitalapi.auspost.com.au/{request.Endpoint.TrimStart('/')}")
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

        _logger.LogInformation("Australia Post API call to {Endpoint} completed in {Ms}ms",
            request.Endpoint, stopwatch.ElapsedMilliseconds);

        return new ApiResponse(
            (int)response.StatusCode,
            responseBody,
            response.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value)),
            (int)stopwatch.ElapsedMilliseconds,
            response.IsSuccessStatusCode ? null : responseBody
        );
    }

    private class AustraliaPostConfig
    {
        public string ApiKey { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
    }
}
