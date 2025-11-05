# API Integration Marketplace

A complete B2B SaaS platform for managing API integrations with pre-built connectors, monitoring, and analytics.

## 🚀 Features

- **5 Pre-built Connectors**: Stripe, SendGrid, Slack, Australia Post, Xero
- **Microservice Architecture**: .NET 8 microservices with API Gateway
- **Modern UI**: Angular 18 with Tailwind CSS
- **Real-time Monitoring**: Track API calls, errors, and performance
- **Multi-tenant**: Organization-based isolation
- **JWT Authentication**: Secure token-based auth
- **Retry Logic**: Automatic retries with Polly
- **Docker Ready**: Full containerization support

## 📋 Prerequisites

- **.NET SDK 8.0+** (for backend development)
- **Node.js 20+** (for frontend development)
- **Docker & Docker Compose** (for running infrastructure)
- **PostgreSQL 16** (or use Docker)

## 🏗️ Architecture

```
┌─────────────────┐
│  Angular 18 UI  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   API    │
    │ Gateway  │
    │ (Ocelot) │
    └────┬─────┘
         │
    ┌────┴─────────────────────────────┐
    │                                   │
┌───▼────────┐  ┌──────────┐  ┌───────▼──────┐
│  Identity  │  │Connector │  │ Integration  │
│  Service   │  │ Service  │  │   Engine     │
└────────────┘  └──────────┘  └──────────────┘
                      │
              ┌───────▼────────┐
              │   Monitoring   │
              │    Service     │
              └────────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              │   Redis/RMQ    │
              └────────────────┘
```

## 🚦 Quick Start

### Option 1: Using Docker Compose (Recommended for Infrastructure)

```bash
# Start infrastructure (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Check services are running
docker-compose ps
```

Access infrastructure:
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)

### Option 2: Local Development (Backend + Frontend)

#### 1. Start Infrastructure

```bash
docker-compose up -d
```

#### 2. Install Frontend Dependencies

```bash
cd src/Frontend
npm install
```

#### 3. Run All Services

Open multiple terminals and run:

```bash
# Terminal 1 - Identity Service
cd src/Services/IdentityService
dotnet run --urls=http://localhost:5001

# Terminal 2 - Connector Service
cd src/Services/ConnectorService
dotnet run --urls=http://localhost:5002

# Terminal 3 - Integration Service
cd src/Services/IntegrationService
dotnet run --urls=http://localhost:5003

# Terminal 4 - Monitoring Service
cd src/Services/MonitoringService
dotnet run --urls=http://localhost:5004

# Terminal 5 - API Gateway
cd src/ApiGateway
dotnet run --urls=http://localhost:5000

# Terminal 6 - Frontend
cd src/Frontend
npm start
```

Access the application:
- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:5000

## 📦 Database Setup

The database migrations run automatically when services start. The ConnectorService will:
1. Create the database if it doesn't exist
2. Apply all migrations
3. Seed 5 pre-configured connectors

To manually manage migrations:

```bash
cd src/Services/ConnectorService

# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback
dotnet ef database update PreviousMigration
```

## 🎯 Using the Platform

### 1. Register an Account

Navigate to http://localhost:4200/register:
- Enter your organization name (e.g., "Acme Corp")
- Provide email and password
- Click "Create Account"

You'll be automatically logged in and redirected to the dashboard.

### 2. Browse Connectors

Go to **Marketplace** to see available connectors:

- 💳 **Stripe** - Payment processing ($29.99/mo)
- 📧 **SendGrid** - Email delivery ($19.99/mo)
- 💬 **Slack** - Team communication ($15.99/mo)
- 📦 **Australia Post** - Shipping ($24.99/mo)
- 💼 **Xero** - Accounting ($34.99/mo)

### 3. Configure a Connector

1. Click "Add" on any connector
2. Enter a descriptive name (e.g., "Production Stripe")
3. Provide required API credentials:
   - **Stripe**: API Secret Key, Webhook Secret (optional)
   - **SendGrid**: API Key, From Email, From Name
   - **Slack**: Webhook URL, Bot Token (optional)
   - **Australia Post**: API Key, Account Number
   - **Xero**: Client ID, Client Secret, Tenant ID
4. Click "Save Configuration"

### 4. Execute API Calls

Use the Integration Engine via the API Gateway:

```bash
POST http://localhost:5000/api/execute/{instanceId}
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "endpoint": "customers",
  "method": "GET",
  "body": "",
  "headers": {}
}
```

Example - Create Stripe Customer:
```bash
curl -X POST http://localhost:5000/api/execute/{stripe-instance-id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "customers",
    "method": "POST",
    "body": "{\"email\":\"customer@example.com\",\"name\":\"John Doe\"}"
  }'
```

### 5. Monitor Performance

Visit the **Monitoring** page to see:
- Total API calls (with week-over-week comparison)
- Active connectors count
- Error rate percentage
- Average response time
- Per-connector performance metrics
- Recent errors with stack traces

## 🔧 Configuration

### Backend Services

Each service uses `appsettings.json` with these settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=apimarketplace;Username=apimarketplace;Password=development123"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-change-in-production-min-32-chars-for-security"
  }
}
```

**Production**: Update the JWT secret and use secure connection strings.

### Frontend API Configuration

The Angular services point to `http://localhost:5000/api` by default. To change:

Update in each service file (`src/Frontend/src/app/core/services/*.service.ts`):

```typescript
private readonly API_URL = 'https://api.yourapi.com';
```

### API Gateway Routes

Routes are configured in `src/ApiGateway/ocelot.json`:

```json
{
  "Routes": [
    {
      "UpstreamPathTemplate": "/api/auth/{everything}",
      "DownstreamHostAndPorts": [{ "Host": "localhost", "Port": 5001 }]
    }
  ]
}
```

## 🧪 Testing

### Manual API Testing

All services expose Swagger UI in development mode:

- Identity Service: http://localhost:5001/swagger
- Connector Service: http://localhost:5002/swagger
- Integration Service: http://localhost:5003/swagger
- Monitoring Service: http://localhost:5004/swagger

### Test Flow

1. **Register**: POST `/api/auth/register`
2. **Get Token**: Copy token from response
3. **List Connectors**: GET `/api/connectors`
4. **Create Instance**: POST `/api/connectors/instances`
5. **Execute Call**: POST `/api/execute/{instanceId}`
6. **Check Monitoring**: GET `/api/metrics/summary`

## 📊 Database Schema

### Key Tables

**organizations**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `subscription_tier` (VARCHAR)
- `created_at` (TIMESTAMP)

**users**
- `id` (UUID, PK)
- `organization_id` (UUID, FK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (VARCHAR)

**connectors**
- `id` (UUID, PK)
- `name` (VARCHAR) - e.g., "Stripe", "SendGrid"
- `category` (VARCHAR) - e.g., "Payments", "Communication"
- `config_schema` (TEXT) - JSON schema for configuration
- `base_price` (DECIMAL)
- `is_active` (BOOLEAN)

**connector_instances**
- `id` (UUID, PK)
- `organization_id` (UUID, FK)
- `connector_id` (UUID, FK)
- `name` (VARCHAR) - User-defined name
- `config` (TEXT) - Encrypted JSON configuration
- `is_active` (BOOLEAN)

**api_calls**
- `id` (UUID, PK)
- `connector_instance_id` (UUID, FK)
- `endpoint` (VARCHAR)
- `method` (VARCHAR)
- `status_code` (INT)
- `response_time_ms` (INT)
- `error_message` (TEXT)
- `created_at` (TIMESTAMP)

## 🔐 Security

### Current Implementation

✅ **JWT Authentication**: Tokens with 7-day expiration
✅ **Password Hashing**: BCrypt with automatic salting
✅ **CORS**: Configured (needs restriction in production)
✅ **Multi-tenancy**: Organization-based data isolation
✅ **Retry Logic**: Exponential backoff with Polly

### Production Requirements

⚠️ **TODO for Production**:

1. **Credential Encryption**: Implement AES-256 encryption for API keys
2. **HTTPS/TLS**: Enforce HTTPS for all endpoints
3. **Rate Limiting**: Configure per-tenant rate limits
4. **Secret Management**: Use Azure Key Vault or AWS Secrets Manager
5. **Audit Logging**: Log all sensitive operations
6. **Input Validation**: Add comprehensive validation
7. **SQL Injection**: Already protected via EF Core parameterization

## 🚢 Deployment

### Docker Production Build

```bash
# Build all service images
docker build -t api-marketplace-identity:latest -f Dockerfile.identity .
docker build -t api-marketplace-connector:latest -f Dockerfile.connector .
docker build -t api-marketplace-integration:latest -f Dockerfile.integration .
docker build -t api-marketplace-monitoring:latest -f Dockerfile.monitoring .
docker build -t api-marketplace-gateway:latest -f Dockerfile.gateway .
docker build -t api-marketplace-frontend:latest -f Dockerfile.frontend .

# Run full stack
docker-compose -f docker-compose.full.yml up -d
```

### Cloud Deployment

#### Azure

```bash
# Create resource group
az group create --name api-marketplace-rg --location eastus

# Create container registry
az acr create --resource-group api-marketplace-rg --name apimarketplaceacr --sku Basic

# Push images
az acr login --name apimarketplaceacr
docker tag api-marketplace-frontend apimarketplaceacr.azurecr.io/frontend:latest
docker push apimarketplaceacr.azurecr.io/frontend:latest

# Deploy to Container Apps
az containerapp up --name api-marketplace \
  --resource-group api-marketplace-rg \
  --image apimarketplaceacr.azurecr.io/frontend:latest
```

#### AWS

```bash
# Create ECR repository
aws ecr create-repository --repository-name api-marketplace

# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Push images
docker tag api-marketplace-frontend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/api-marketplace:frontend
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/api-marketplace:frontend

# Deploy to ECS/Fargate
aws ecs create-cluster --cluster-name api-marketplace-cluster
```

## 🛠️ Development

### Project Structure

```
ApiConnect/
├── src/
│   ├── ApiGateway/                 # Ocelot API Gateway
│   │   ├── Program.cs
│   │   └── ocelot.json
│   ├── Services/
│   │   ├── IdentityService/        # Authentication & users
│   │   │   ├── Controllers/AuthController.cs
│   │   │   └── Services/TokenService.cs
│   │   ├── ConnectorService/       # Connector management
│   │   │   ├── Controllers/ConnectorsController.cs
│   │   │   └── Data/AppDbContext.cs
│   │   ├── IntegrationService/     # API execution
│   │   │   ├── Controllers/ExecuteController.cs
│   │   │   └── Executors/
│   │   │       ├── StripeExecutor.cs
│   │   │       ├── SendGridExecutor.cs
│   │   │       ├── SlackExecutor.cs
│   │   │       ├── AustraliaPostExecutor.cs
│   │   │       └── XeroExecutor.cs
│   │   └── MonitoringService/      # Metrics & analytics
│   │       └── Controllers/MetricsController.cs
│   ├── Shared/                     # Shared models & DTOs
│   │   ├── Models/
│   │   └── DTOs/
│   └── Frontend/                   # Angular 18 application
│       └── src/app/
│           ├── core/               # Services, guards, interceptors
│           ├── features/           # Feature modules
│           └── shared/             # Shared components
├── docker-compose.yml              # Infrastructure services
└── README.md
```

### Adding a New Connector

1. **Add Seed Data** in `ConnectorService/Data/AppDbContext.cs`:

```csharp
new Connector
{
    Id = Guid.NewGuid(),
    Name = "Shopify",
    Description = "E-commerce platform",
    Category = "E-commerce",
    LogoUrl = "/assets/logos/shopify.svg",
    BasePrice = 29.99m,
    ConfigSchema = @"{ ""apiKey"": { ""type"": ""string"", ""required"": true } }"
}
```

2. **Create Executor** in `IntegrationService/Executors/ShopifyExecutor.cs`:

```csharp
public class ShopifyExecutor : IConnectorExecutor
{
    public string ConnectorName => "Shopify";

    public async Task<ApiResponse> ExecuteAsync(ConnectorInstance instance, ApiRequest request)
    {
        // Implementation
    }
}
```

3. **Register Executor** in `IntegrationService/Program.cs`:

```csharp
builder.Services.AddScoped<IConnectorExecutor, ShopifyExecutor>();
```

4. **Add Logo**: Place logo in `Frontend/src/assets/logos/shopify.svg`

## 📝 API Documentation

### Authentication

```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "organizationName": "Acme Corp"
}

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "role": "Admin",
    "organizationId": "guid",
    "organizationName": "Acme Corp"
  }
}
```

### Connectors

```
GET /api/connectors
GET /api/connectors/{id}

POST /api/connectors/instances
{
  "connectorId": "guid",
  "name": "My Stripe Integration",
  "config": "{\"apiKey\":\"sk_test_...\"}"
}

GET /api/connectors/instances
GET /api/connectors/instances/{id}
PUT /api/connectors/instances/{id}
DELETE /api/connectors/instances/{id}
POST /api/connectors/instances/{id}/test
```

### Integration Execution

```
POST /api/execute/{instanceId}
{
  "endpoint": "customers",
  "method": "POST",
  "body": "{\"email\":\"test@example.com\"}",
  "headers": { "Idempotency-Key": "unique-key" }
}

Response:
{
  "statusCode": 200,
  "body": "{...}",
  "headers": { "content-type": "application/json" },
  "responseTimeMs": 156
}
```

### Monitoring

```
GET /api/metrics/summary
GET /api/metrics/usage?days=7
GET /api/metrics/activity?limit=20
GET /api/metrics/errors?limit=50
GET /api/metrics/performance?days=7
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

Need help?
- 📧 Email: support@apimarketplace.com
- 📖 Documentation: https://docs.apimarketplace.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/apimarketplace/issues)

## 🎯 Roadmap

### Phase 2 (Next)
- [ ] Additional connectors (Shopify, WooCommerce, PayPal, Twilio, MYOB)
- [ ] Webhook management system
- [ ] Visual data transformation UI
- [ ] Connector testing playground

### Phase 3 (Future)
- [ ] Custom connector builder
- [ ] Billing & subscription management (Stripe integration)
- [ ] White-label capabilities
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] GraphQL API support

## ⭐ Tech Stack

**Backend**
- .NET 8
- Entity Framework Core
- PostgreSQL
- Redis
- RabbitMQ
- Ocelot (API Gateway)
- Polly (Resilience)
- BCrypt (Password hashing)

**Frontend**
- Angular 18 (Standalone components)
- Tailwind CSS
- TypeScript
- RxJS
- Chart.js (Future)

**DevOps**
- Docker & Docker Compose
- GitHub Actions (Future CI/CD)
- Nginx

---

**Made with ❤️ for simplifying API integrations**

_Build once, integrate everywhere._