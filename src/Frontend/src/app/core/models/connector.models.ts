export interface Connector {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  basePrice: number;
  isPopular: boolean;
  isNew: boolean;
  activeUsers: number;
  reliability: number;
}

export interface ConnectorInstance {
  id: string;
  name: string;
  connectorId: string;
  connectorName: string;
  connectorLogo: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateInstanceDto {
  connectorId: string;
  name: string;
  config: string;
}

export interface ApiRequest {
  endpoint: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
}

export interface ApiResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  responseTimeMs: number;
  errorMessage?: string;
}
