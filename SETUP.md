# API Marketplace - Setup & Configuration Guide

## 🚨 CRITICAL CONFIGURATIONS

All critical configurations have been set up in this repository. This guide explains what has been configured and how to verify everything is working correctly.

### ✅ Configured Items

#### 1. Environment Variables (.env files)

Environment files have been created for all services with proper configuration:

- **ApiGateway** (`src/ApiGateway/.env`)
  - JWT_SECRET configured
  - ASPNETCORE_URLS set to http://localhost:5000

- **IdentityService** (`src/Services/IdentityService/.env`)
  - JWT_SECRET configured
  - DATABASE_CONNECTION for PostgreSQL
  - ASPNETCORE_URLS set to http://localhost:5001

- **ConnectorService** (`src/Services/ConnectorService/.env`)
  - DATABASE_CONNECTION for PostgreSQL
  - REDIS_CONNECTION configured
  - ENCRYPTION_KEY for API credentials
  - ASPNETCORE_URLS set to http://localhost:5002

- **IntegrationService** (`src/Services/IntegrationService/.env`)
  - ASPNETCORE_URLS set to http://localhost:5003

- **MonitoringService** (`src/Services/MonitoringService/.env`)
  - ASPNETCORE_URLS set to http://localhost:5004

#### 2. Angular Environment Files

Created in `src/Frontend/src/environments/`:
- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

Both files configured with proper API and WebSocket URLs.

#### 3. CORS Configuration

Updated all microservices with secure CORS policy:
- Changed from "AllowAll" to "AllowAngular"
- Restricted to `http://localhost:4200` origin
- Enabled credentials support
- Applied to all 5 services

#### 4. Angular Lucide Icons

Configured in `src/Frontend/src/app/app.config.ts` with all required icons:
- Activity, Plug, Users, Clock, Database, Zap, TrendingUp
- CheckCircle, XCircle, AlertCircle, Search, Plus
- Settings, LogOut, Home, BarChart

#### 5. CryptoHelper Utility

Created `src/Shared/Helpers/CryptoHelper.cs` with:
- AES encryption/decryption methods
- Proper IV generation for security
- Key generation utility

#### 6. Health Check Endpoints

Added to all services at `/health`:
- ApiGateway: http://localhost:5000/health
- IdentityService: http://localhost:5001/health
- ConnectorService: http://localhost:5002/health
- IntegrationService: http://localhost:5003/health
- MonitoringService: http://localhost:5004/health

#### 7. Frontend Assets

Created `src/Frontend/src/assets/logos/` directory with README for logo management.

#### 8. Tailwind CSS & Fonts

Updated `src/Frontend/src/styles.scss` with:
- Inter font family import
- Proper Tailwind directives
- Custom component styles
- Utility classes

---

## 🏃 STARTUP SEQUENCE

### Prerequisites

1. **Docker & Docker Compose** installed
2. **.NET 8 SDK** installed
3. **Node.js 18+** and npm installed
4. **PostgreSQL** (via Docker)
5. **Redis** (via Docker)

### Step-by-Step Startup

#### 1. Start Infrastructure

```bash
# From project root
docker-compose up -d

# Verify containers are running
docker ps
```

Expected containers:
- `apimarketplace_postgres_1`
- `apimarketplace_redis_1`

#### 2. Verify Database

```bash
# If database doesn't exist, create it
docker exec -it apimarketplace_postgres_1 psql -U apimarketplace -c "CREATE DATABASE apimarketplace;"
```

#### 3. Apply Database Migrations

```bash
cd src/Services/ConnectorService
dotnet ef database update
cd ../../..
```

#### 4. Start All Microservices

**Option A: Use the startup script (recommended)**

```bash
chmod +x start-services.sh
./start-services.sh
```

**Option B: Manual startup (each in separate terminal)**

```bash
# Terminal 1 - API Gateway
cd src/ApiGateway
dotnet run

# Terminal 2 - Identity Service
cd src/Services/IdentityService
dotnet run

# Terminal 3 - Connector Service
cd src/Services/ConnectorService
dotnet run

# Terminal 4 - Integration Service
cd src/Services/IntegrationService
dotnet run

# Terminal 5 - Monitoring Service
cd src/Services/MonitoringService
dotnet run

# Terminal 6 - Angular Frontend
cd src/Frontend
npm install  # First time only
ng serve
```

#### 5. Verify Services

All services should be running on their designated ports. Test with:

```bash
curl http://localhost:5000/health  # Gateway
curl http://localhost:5001/health  # Identity
curl http://localhost:5002/health  # Connector
curl http://localhost:5003/health  # Integration
curl http://localhost:5004/health  # Monitoring
```

Expected response from each:
```json
{
  "status": "healthy",
  "service": "ServiceName",
  "timestamp": "2025-11-05T..."
}
```

#### 6. Access the Application

Open your browser to: **http://localhost:4200**

---

## 🔧 TROUBLESHOOTING

### PostgreSQL Connection Issues

**Error:** "database does not exist"

```bash
docker exec -it apimarketplace_postgres_1 psql -U apimarketplace -c "CREATE DATABASE apimarketplace;"
```

### Port Already in Use

**Error:** "Address already in use"

```bash
# Find process using the port (example for port 5000)
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors in Browser

Verify:
1. Angular is running on `http://localhost:4200`
2. All services have "AllowAngular" CORS policy
3. Credentials are enabled in CORS configuration

### Missing NuGet Packages

```bash
# Run in each service directory if needed
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.Extensions.Configuration.EnvironmentVariables
dotnet add package Serilog.Sinks.Console
```

### Angular Module Errors

```bash
cd src/Frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ VERIFICATION CHECKLIST

Test these key features to ensure everything is working:

1. ✓ Can register a new user
2. ✓ Can login and receive JWT token
3. ✓ Can see 5 connectors in marketplace
4. ✓ Can add a connector instance
5. ✓ Can execute an API call through a connector
6. ✓ Dashboard shows metrics
7. ✓ UI is responsive and displays correctly

---

## 📚 ADDITIONAL RESOURCES

### Service Architecture

```
┌─────────────┐
│   Angular   │ :4200
│  Frontend   │
└─────┬───────┘
      │
┌─────▼───────┐
│ API Gateway │ :5000
└─────┬───────┘
      │
      ├──────────┬──────────┬──────────┬──────────┐
      │          │          │          │          │
┌─────▼───┐ ┌──▼──┐ ┌─────▼─────┐ ┌──▼──┐ ┌────▼────┐
│Identity │ │Conn-│ │Integration│ │Moni-│ │Database │
│ :5001   │ │ector│ │  :5003    │ │toring│ │& Redis  │
│         │ │:5002│ │           │ │:5004│ │         │
└─────────┘ └─────┘ └───────────┘ └─────┘ └─────────┘
```

### Environment Variable Priority

1. `.env` files (highest priority)
2. `appsettings.json`
3. `appsettings.Development.json`
4. Environment variables
5. Hard-coded defaults (lowest priority)

### Security Notes

⚠️ **IMPORTANT:** The current configuration uses development secrets!

Before deploying to production:
1. Generate new JWT secrets (minimum 256 bits)
2. Generate new encryption keys
3. Use secure database passwords
4. Enable HTTPS/TLS
5. Configure proper CORS origins
6. Enable rate limiting
7. Set up proper logging and monitoring

---

## 🚀 QUICK START (TL;DR)

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Start all services
./start-services.sh

# 3. Open browser
# Navigate to http://localhost:4200
```

That's it! The application should now be running.

---

## 📝 Notes

- All configuration files are already in place
- No manual configuration needed for development
- Services auto-migrate database on startup
- Health checks available on all services
- Swagger UI available in development mode at `/swagger`

For issues, check service logs or the troubleshooting section above.
