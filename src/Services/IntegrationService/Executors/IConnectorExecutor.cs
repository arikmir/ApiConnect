using ApiMarketplace.Shared.Models;
using ApiMarketplace.Shared.DTOs;

namespace ApiMarketplace.IntegrationService.Executors;

public interface IConnectorExecutor
{
    string ConnectorName { get; }
    Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request);
}
