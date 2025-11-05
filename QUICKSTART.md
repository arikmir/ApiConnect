# 🚀 Quick Start Guide

Get the API Integration Marketplace running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Docker Desktop running
- Terminal/Command Prompt

## Step 1: Start Infrastructure (30 seconds)

```bash
# Start PostgreSQL, Redis, and RabbitMQ
docker-compose up -d

# Wait for services to be healthy (check with)
docker-compose ps
```

## Step 2: Install Frontend Dependencies (2 minutes)

```bash
cd src/Frontend
npm install
```

## Step 3: Start the Application

Open **6 separate terminal windows** and run:

### Terminal 1 - Identity Service
```bash
cd src/Services/IdentityService
dotnet run --urls=http://localhost:5001
```

### Terminal 2 - Connector Service
```bash
cd src/Services/ConnectorService
dotnet run --urls=http://localhost:5002
```

### Terminal 3 - Integration Service
```bash
cd src/Services/IntegrationService
dotnet run --urls=http://localhost:5003
```

### Terminal 4 - Monitoring Service
```bash
cd src/Services/MonitoringService
dotnet run --urls=http://localhost:5004
```

### Terminal 5 - API Gateway
```bash
cd src/ApiGateway
dotnet run --urls=http://localhost:5000
```

### Terminal 6 - Frontend
```bash
cd src/Frontend
npm start
```

## Step 4: Access the Application

Open your browser: **http://localhost:4200**

## First Time Setup

1. **Register**: Create an account
   - Organization: "Test Company"
   - Email: test@example.com
   - Password: SecurePass123!

2. **Browse Marketplace**: Check out the 5 pre-built connectors

3. **Add a Connector**:
   - Click "Add" on any connector
   - Configure with test credentials
   - Save!

4. **Monitor**: Visit the Monitoring page to see your metrics

## Troubleshooting

### "Port already in use"
Kill the process using that port:
```bash
# macOS/Linux
lsof -ti:5001 | xargs kill -9

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### "Cannot connect to database"
Ensure Docker is running and PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs postgres
```

### Frontend won't start
Clear cache and reinstall:
```bash
cd src/Frontend
rm -rf node_modules package-lock.json
npm install
```

## What's Running?

- **Frontend**: http://localhost:4200
- **API Gateway**: http://localhost:5000
- **Identity Service**: http://localhost:5001
- **Connector Service**: http://localhost:5002
- **Integration Service**: http://localhost:5003
- **Monitoring Service**: http://localhost:5004
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ UI**: http://localhost:15672

## Next Steps

- Read the [full README](README.md)
- Explore the [API documentation](README.md#-api-documentation)
- Try the Swagger UIs at each service's `/swagger` endpoint
- Configure real API credentials
- Execute your first API call!

---

**Need Help?** Check the [README.md](README.md) or open an issue on GitHub.
