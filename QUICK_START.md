# API Marketplace - Quick Start Guide

Get the API Marketplace up and running in under 5 minutes!

## 🚀 Quick Start (3 Steps)

### 1. Install Prerequisites

Ensure you have these installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

### 2. Start Everything

```bash
./start-services.sh
```

That's it! The script will:
- ✓ Start PostgreSQL and Redis (Docker)
- ✓ Create the database if needed
- ✓ Start all 5 microservices
- ✓ Start the Angular frontend
- ✓ Run health checks
- ✓ Open the browser automatically

### 3. Use the Application

The browser will open to http://localhost:4200

**First-time setup:**
1. Register a new user account
2. Login with your credentials
3. Browse the connector marketplace
4. Add a connector (e.g., Stripe, SendGrid)
5. Execute API calls through the connectors

## 🛑 Stop Everything

```bash
./stop-services.sh
```

This will stop all services and clean up log files.

---

## 📋 Manual Startup (Alternative)

If you prefer to start services manually:

### Step 1: Start Infrastructure

```bash
docker-compose up -d
```

### Step 2: Start Services (in separate terminals)

```bash
# Terminal 1
cd src/ApiGateway && dotnet run

# Terminal 2
cd src/Services/IdentityService && dotnet run

# Terminal 3
cd src/Services/ConnectorService && dotnet run

# Terminal 4
cd src/Services/IntegrationService && dotnet run

# Terminal 5
cd src/Services/MonitoringService && dotnet run

# Terminal 6
cd src/Frontend && npm install && ng serve
```

### Step 3: Open Browser

Navigate to http://localhost:4200

---

## 🔍 Verify Everything is Working

### Health Checks

All services have health check endpoints:

```bash
curl http://localhost:5000/health  # Gateway
curl http://localhost:5001/health  # Identity
curl http://localhost:5002/health  # Connector
curl http://localhost:5003/health  # Integration
curl http://localhost:5004/health  # Monitoring
```

### Swagger Documentation

Access Swagger UI for API documentation:
- Identity Service: http://localhost:5001/swagger
- Connector Service: http://localhost:5002/swagger
- Integration Service: http://localhost:5003/swagger
- Monitoring Service: http://localhost:5004/swagger

### View Logs

```bash
# View all service logs
tail -f /tmp/apimarketplace-*.log

# View specific service log
tail -f /tmp/apimarketplace-ApiGateway.log
tail -f /tmp/apimarketplace-IdentityService.log
tail -f /tmp/apimarketplace-frontend.log
```

---

## ✅ Feature Verification Checklist

After startup, verify these features work:

- [ ] Can access the Angular app at http://localhost:4200
- [ ] Can register a new user account
- [ ] Can login and see the dashboard
- [ ] Can see 5 connectors in the marketplace
  - Stripe (Payment Gateway)
  - SendGrid (Email Service)
  - Slack (Messaging)
  - Australia Post (Shipping)
  - Xero (Accounting)
- [ ] Can add a connector instance
- [ ] Can configure connector credentials
- [ ] Can execute an API call through a connector
- [ ] Dashboard shows usage metrics
- [ ] UI is responsive and loads quickly

---

## 🔧 Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Find and kill the process
lsof -i :5000  # Replace 5000 with the port number
kill -9 <PID>

# Or use the stop script
./stop-services.sh
```

### Database Connection Issues

```bash
# Recreate the database
docker exec -it apimarketplace_postgres_1 psql -U apimarketplace -c "DROP DATABASE IF EXISTS apimarketplace;"
docker exec -it apimarketplace_postgres_1 psql -U apimarketplace -c "CREATE DATABASE apimarketplace;"

# Restart services
./stop-services.sh
./start-services.sh
```

### Angular Build Errors

```bash
cd src/Frontend
rm -rf node_modules package-lock.json
npm install
ng serve
```

### Service Not Responding

```bash
# Check service logs
tail -f /tmp/apimarketplace-<ServiceName>.log

# Restart specific service
cd src/<ServicePath>
dotnet run
```

---

## 📚 Additional Documentation

For detailed setup and configuration information, see:
- [SETUP.md](SETUP.md) - Complete setup guide with all configuration details
- [README.md](README.md) - Project overview and architecture

---

## 🎯 What's Next?

After getting everything running:

1. **Explore the API** - Use Swagger UI to test endpoints
2. **Add Connectors** - Try adding and configuring each connector
3. **Execute API Calls** - Test the integration functionality
4. **Monitor Usage** - Check the monitoring dashboard for metrics
5. **Customize** - Modify the code to add new features

---

## 💡 Tips

- **Development Mode**: All services run with hot reload enabled
- **Logs Location**: All logs are written to `/tmp/apimarketplace-*.log`
- **Database Migrations**: Applied automatically on service startup
- **CORS**: Configured for `http://localhost:4200` only
- **JWT Tokens**: Valid for 24 hours in development mode

---

## 🆘 Need Help?

1. Check the logs: `tail -f /tmp/apimarketplace-*.log`
2. Verify health checks: `curl http://localhost:5000/health`
3. Review [SETUP.md](SETUP.md) for detailed troubleshooting
4. Ensure all prerequisites are installed correctly
5. Try stopping and restarting: `./stop-services.sh && ./start-services.sh`

---

**Happy coding! 🚀**
