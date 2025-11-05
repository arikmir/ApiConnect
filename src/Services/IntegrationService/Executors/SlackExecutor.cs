using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;

namespace ApiMarketplace.IntegrationService.Executors;

public class SlackExecutor : IConnectorExecutor
{
    public string ConnectorName => "Slack";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SlackExecutor> _logger;

    public SlackExecutor(IHttpClientFactory httpClientFactory, ILogger<SlackExecutor> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request)
    {
        var config = JsonSerializer.Deserialize<SlackConfig>(instance.Config);
        if (config == null || string.IsNullOrEmpty(config.WebhookUrl))
            throw new InvalidOperationException("Invalid Slack configuration");

        var client = _httpClientFactory.CreateClient();

        // If using webhook
        if (request.Endpoint == "webhook" || string.IsNullOrEmpty(request.Endpoint))
        {
            var stopwatch = Stopwatch.StartNew();
            var response = await client.PostAsync(
                config.WebhookUrl,
                new StringContent(request.Body ?? "{}", Encoding.UTF8, "application/json"));
            stopwatch.Stop();

            var responseBody = await response.Content.ReadAsStringAsync();

            return new ApiResponse(
                (int)response.StatusCode,
                responseBody,
                response.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value)),
                (int)stopwatch.ElapsedMilliseconds,
                response.IsSuccessStatusCode ? null : responseBody
            );
        }

        // For API calls with bot token
        if (!string.IsNullOrEmpty(config.BotToken))
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config.BotToken);
        }

        var httpRequest = new HttpRequestMessage
        {
            Method = new HttpMethod(request.Method),
            RequestUri = new Uri($"https://slack.com/api/{request.Endpoint.TrimStart('/')}")
        };

        if (!string.IsNullOrEmpty(request.Body))
        {
            httpRequest.Content = new StringContent(request.Body, Encoding.UTF8, "application/json");
        }

        var sw = Stopwatch.StartNew();
        var resp = await client.SendAsync(httpRequest);
        sw.Stop();

        var respBody = await resp.Content.ReadAsStringAsync();

        _logger.LogInformation("Slack API call to {Endpoint} completed in {Ms}ms",
            request.Endpoint, sw.ElapsedMilliseconds);

        return new ApiResponse(
            (int)resp.StatusCode,
            respBody,
            resp.Headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value)),
            (int)sw.ElapsedMilliseconds,
            resp.IsSuccessStatusCode ? null : respBody
        );
    }

    private class SlackConfig
    {
        public string WebhookUrl { get; set; } = string.Empty;
        public string? BotToken { get; set; }
    }
}
