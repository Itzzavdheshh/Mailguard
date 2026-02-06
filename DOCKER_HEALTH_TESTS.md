# Docker Health Checks and Networking Test Suite

This document provides commands to verify Docker health checks and network connectivity.

## Health Check Verification

### 1. Check Service Health Status

```bash
# View all container health status
docker compose ps

# Expected output should show "(healthy)" for all services:
# mailguard-mongo     Up (healthy)
# mailguard-ml        Up (healthy)
# mailguard-backend   Up (healthy)
# mailguard-frontend  Up (healthy)
```

### 2. Inspect Individual Health Checks

```bash
# MongoDB health check
docker inspect mailguard-mongo --format='{{json .State.Health}}' | ConvertFrom-Json

# ML Service health check
docker inspect mailguard-ml --format='{{json .State.Health}}' | ConvertFrom-Json

# Backend health check
docker inspect mailguard-backend --format='{{json .State.Health}}' | ConvertFrom-Json

# Frontend health check
docker inspect mailguard-frontend --format='{{json .State.Health}}' | ConvertFrom-Json
```

### 3. Manual Health Check Tests

```bash
# Test MongoDB health (inside container)
docker exec mailguard-mongo mongosh --username admin --password YOUR_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }

# Test ML Service health
curl http://localhost:8000/health
# Expected: {"status":"ok","model_loaded":true,"model_version":"..."}

# Test Backend health
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"...","database":{"connected":true}}

# Test Frontend health
curl http://localhost:3000/health
# Expected: healthy
```

### 4. Test Readiness Probes

```bash
# Backend readiness
curl http://localhost:5000/health/ready
# Expected: {"ready":true,"message":"Server is ready to accept traffic"}

# Backend liveness
curl http://localhost:5000/health/live
# Expected: {"alive":true,"message":"Server process is alive"}
```

## Network Connectivity Tests

### 1. Verify Docker Network Exists

```bash
docker network ls | grep mailguard
# Expected: mailguard-network (bridge)

docker network inspect mailguard-network
# Should show all 4 containers connected
```

### 2. DNS Resolution Tests

Test that containers can resolve each other by service name:

```bash
# From backend, resolve ML service
docker exec mailguard-backend nslookup ml-service
# Expected: Name: ml-service, Address: 172.x.x.x

# From backend, resolve MongoDB
docker exec mailguard-backend nslookup mongo
# Expected: Name: mongo, Address: 172.x.x.x

# From frontend, resolve backend
docker exec mailguard-frontend nslookup backend
# Expected: Name: backend, Address: 172.x.x.x
```

### 3. Network Connectivity Tests

Test actual HTTP connectivity between services:

```bash
# Backend → ML Service
docker exec mailguard-backend node -e "
const http = require('http');
http.get('http://ml-service:8000/health', (res) => {
  console.log('ML Service Status:', res.statusCode);
  res.on('data', d => console.log(d.toString()));
}).on('error', e => console.error('Error:', e.message));
"

# Backend → MongoDB (test from Node.js)
docker exec mailguard-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB connected'); mongoose.connection.close(); })
  .catch(e => console.error('MongoDB error:', e.message));
"

# Frontend → Backend (from nginx container)
docker exec mailguard-frontend wget -q -O- http://backend:5000/health
```

### 4. Port Exposure Tests

Verify services are NOT accessible from outside the Docker network on internal ports:

```bash
# These should work (exposed ports):
curl http://localhost:3000/health    # Frontend
curl http://localhost:5000/health    # Backend  
curl http://localhost:8000/health    # ML Service

# MongoDB port 27017 is exposed but should require auth
# Test connection is rejected without credentials:
# (This will timeout or fail - expected behavior)
```

### 5. Network Isolation Test

Verify services can ONLY communicate within mailguard-network:

```bash
# Try to reach another Docker network (should fail)
docker run --rm --network bridge alpine ping -c 1 mailguard-backend
# Expected: ping: bad address 'mailguard-backend'

# Verify services ARE reachable within mailguard-network
docker run --rm --network mailguard-network alpine ping -c 1 mailguard-backend
# Expected: 1 packets transmitted, 1 received
```

## Dependency Chain Verification

The service startup order is enforced by health check dependencies:

```
Start Order:
1. mongo (waits for health check to pass)
2. ml-service (waits for health check to pass)
3. backend (depends on mongo + ml-service being healthy)
4. frontend (depends on backend being healthy)
```

### Test Dependency Chain

```bash
# Force restart MongoDB and watch cascade
docker compose restart mongo
docker compose logs -f

# You should see:
# 1. mongo restarting
# 2. backend waiting for mongo to be healthy
# 3. frontend waiting for backend to be healthy
```

### Test Failure Scenarios

```bash
# Simulate ML Service failure
docker exec mailguard-ml pkill -9 python

# Watch health checks fail and backend respond
docker compose ps
# ML service should show "(unhealthy)"

# Backend should still run but /api/emails/classify will return errors
curl http://localhost:5000/health
# Should return 200 (backend is alive, just ML service is down)
```

## Common Health Check Issues

### Issue: Container shows "unhealthy"

**Diagnosis:**
```bash
# Check last health check output
docker inspect <container> --format='{{json .State.Health.Log}}' | ConvertFrom-Json | Select-Object -Last 1

# Check container logs
docker compose logs <service>
```

**Common Causes:**
- MongoDB: Authentication failure (wrong password)
- ML Service: Model files not loaded
- Backend: Database connection failure
- Frontend: Nginx not started

### Issue: Services can't communicate

**Diagnosis:**
```bash
# Verify all containers are on same network
docker network inspect mailguard-network

# Test DNS resolution
docker exec <container> nslookup <target-service>

# Check firewall rules (shouldn't be needed for bridge networks)
```

**Common Causes:**
- Containers on different networks
- Service names misspelled in environment variables
- Containers not fully started yet

### Issue: Health checks taking too long

**Diagnosis:**
```bash
# Check current health check timing
docker inspect <container> --format='{{json .State.Health}}'
```

**Tuning:**
Edit `docker-compose.yml` health check parameters:
- `start_period`: Initial grace period (increase for slow startups)
- `interval`: Time between checks (decrease for faster detection)
- `timeout`: Max time for check to complete
- `retries`: Number of failures before marking unhealthy

## Network Performance Tests

### Test Latency Between Services

```bash
# Backend → ML Service latency
docker exec mailguard-backend time node -e "
const axios = require('axios');
axios.get('http://ml-service:8000/health')
  .then(() => console.log('Success'))
  .catch(e => console.error('Error:', e.message));
"

# Should be <100ms for container-to-container communication
```

### Test Throughput

```bash
# Simulate multiple concurrent requests
for i in {1..10}; do
  curl -s http://localhost:5000/health &
done
wait

# All should return quickly (< 1 second total)
```

## Security Verification

### Verify Network Isolation

```bash
# Services should NOT be accessible from host using container IPs
docker inspect mailguard-backend --format='{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
# Try to curl this IP from host - should fail or timeout

# Services should ONLY be accessible via exposed ports
curl http://localhost:5000/health  # ✓ Works (exposed)
curl http://172.x.x.x:5000/health  # ✗ Should not work from host
```

### Verify MongoDB Authentication

```bash
# Connection without auth should fail
docker exec mailguard-mongo mongosh --eval "db.adminCommand('ping')"
# Expected: MongoServerError: Authentication failed

# Connection with auth should succeed
docker exec mailguard-mongo mongosh -u admin -p YOUR_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }
```

## Automated Test Script

Save this as `test-docker-health.ps1`:

```powershell
#!/usr/bin/env pwsh

Write-Host "=== Docker Health Check Test Suite ===" -ForegroundColor Cyan

# Test 1: Container Status
Write-Host "`n[1/5] Checking container health status..." -ForegroundColor Yellow
docker compose ps

# Test 2: Health Endpoints
Write-Host "`n[2/5] Testing health endpoints..." -ForegroundColor Yellow
$endpoints = @(
    "http://localhost:5000/health",
    "http://localhost:8000/health",
    "http://localhost:3000/health"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $endpoint - Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: DNS Resolution
Write-Host "`n[3/5] Testing DNS resolution..." -ForegroundColor Yellow
$dnsTests = @(
    @{Container="mailguard-backend"; Target="ml-service"},
    @{Container="mailguard-backend"; Target="mongo"},
    @{Container="mailguard-frontend"; Target="backend"}
)

foreach ($test in $dnsTests) {
    try {
        docker exec $test.Container nslookup $test.Target | Out-Null
        Write-Host "✓ $($test.Container) → $($test.Target)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($test.Container) → $($test.Target) - Failed" -ForegroundColor Red
    }
}

# Test 4: Network Connectivity
Write-Host "`n[4/5] Testing network connectivity..." -ForegroundColor Yellow
try {
    docker exec mailguard-backend node -e "require('http').get('http://ml-service:8000/health', r => console.log(r.statusCode))" 2>$null
    Write-Host "✓ Backend can reach ML Service" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend cannot reach ML Service" -ForegroundColor Red
}

# Test 5: MongoDB Authentication
Write-Host "`n[5/5] Testing MongoDB authentication..." -ForegroundColor Yellow
try {
    docker exec mailguard-mongo mongosh -u admin -p change_this_password --authenticationDatabase admin --eval "db.adminCommand('ping')" --quiet | Out-Null
    Write-Host "✓ MongoDB authentication working" -ForegroundColor Green
} catch {
    Write-Host "✗ MongoDB authentication failed" -ForegroundColor Red
}

Write-Host "`n=== Test Suite Complete ===" -ForegroundColor Cyan
```

Run with: `pwsh test-docker-health.ps1`

## Troubleshooting Commands

```bash
# View real-time logs from all services
docker compose logs -f

# View logs from specific service
docker compose logs -f backend

# Restart unhealthy service
docker compose restart <service>

# Rebuild and restart service
docker compose up --build -d <service>

# Check network connectivity in detail
docker network inspect mailguard-network --format='{{json .Containers}}' | ConvertFrom-Json

# Force recreate all containers
docker compose up --force-recreate -d
```

## Best Practices

1. **Always wait for health checks** before testing application functionality
2. **Monitor health status** in production with external tools (Prometheus, Datadog)
3. **Set appropriate timeouts** - balance between fast failure detection and startup time
4. **Test failure scenarios** - kill services, simulate network issues
5. **Use readiness probes** for load balancers (backend/health/ready)
6. **Use liveness probes** for restart decisions (backend/health/live)
7. **Log health check failures** - helps diagnose intermittent issues
