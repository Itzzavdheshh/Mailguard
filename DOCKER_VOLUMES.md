# Docker Volume Persistence Testing Guide

This guide covers testing and verifying data persistence for all Docker volumes in the Mailguard stack.

## Overview

Mailguard uses **4 named Docker volumes** for data persistence:

| Volume | Mount Point | Purpose | Data Stored |
|--------|-------------|---------|-------------|
| `mailguard-mongo-data` | `/data/db` | MongoDB data | Users, emails, classifications, feedback |
| `mailguard-mongo-config` | `/data/configdb` | MongoDB config | Database configuration |
| `mailguard-ml-models` | `/app/models` | ML models | Trained models (*.pkl), metadata |
| `mailguard-ml-datasets` | `/app/datasets` | Training data | Dataset CSVs for retraining |

## Volume Configuration

### Environment Variables

The ML service uses environment variables to locate persistent directories:

```bash
MODEL_DIR=/app/models      # Where models are loaded/saved
DATASET_DIR=/app/datasets  # Where training datasets are stored
```

These are configured in:
- `ml-service/Dockerfile` (default values)
- `docker-compose.yml` (explicit configuration)

### Backwards Compatibility

The code works both with and without volumes:
- **Docker (with volumes)**: Uses `/app/models` and `/app/datasets`
- **Local dev (no volumes)**: Uses current directory

## Testing Volume Persistence

### Test 1: MongoDB Data Persistence

**Verify database survives container restart:**

```bash
# Start services
docker compose up -d

# Create test data (via API or mongo shell)
docker exec -it mailguard-mongo mongosh -u admin -p YOUR_PASSWORD --authenticationDatabase admin
> use mailguard
> db.test.insertOne({message: "persistence test", timestamp: new Date()})
> db.test.find()

# Restart MongoDB container
docker compose restart mongo

# Verify data persists
docker exec -it mailguard-mongo mongosh -u admin -p YOUR_PASSWORD --authenticationDatabase admin
> use mailguard
> db.test.find()
# Should still show the test document
```

**Expected Result:** ✅ Data persists after restart

### Test 2: ML Model Persistence

**Verify ML models survive container restart:**

```bash
# Step 1: Check initial model version
curl http://localhost:8000/model/status
# Note the version and trained_at timestamp

# Step 2: Trigger model retraining (via API)
curl -X POST http://localhost:5000/api/admin/retrain \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rebuild_dataset": true}'

# Step 3: Check new model version
curl http://localhost:8000/model/status
# Should show updated version and newer timestamp

# Step 4: Restart ML service container
docker compose restart ml-service

# Step 5: Verify model persisted
curl http://localhost:8000/model/status
# Should still show the SAME version from step 3, not reverted to step 1
```

**Expected Result:** ✅ Retrained model persists after restart

### Test 3: Dataset Persistence

**Verify training datasets survive container restart:**

```bash
# Step 1: Build dataset (via API)
curl -X POST http://localhost:5000/api/admin/dataset/build \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 2: Check dataset exists in container
docker exec mailguard-ml ls -lh /app/datasets/
# Should show training.csv

# Step 3: Restart ML service
docker compose restart ml-service

# Step 4: Verify dataset still exists
docker exec mailguard-ml ls -lh /app/datasets/
# Should still show training.csv with same size/timestamp
```

**Expected Result:** ✅ Dataset persists after restart

### Test 4: Complete Stack Restart

**Verify ALL data survives complete stack restart:**

```bash
# Create test data in all services
# (MongoDB data, ML models, training datasets)

# Stop entire stack
docker compose down

# Start stack again
docker compose up -d

# Verify all data:
# 1. MongoDB data still exists
# 2. ML models still loaded
# 3. Training datasets still available
```

**Expected Result:** ✅ All data persists after full restart

### Test 5: Volume Recreation (Data Loss)

**Verify data is LOST when volumes are removed:**

```bash
# Stop and remove containers AND volumes
docker compose down -v  # ⚠️ -v flag removes volumes!

# Start stack
docker compose up -d

# Check ML model status
curl http://localhost:8000/model/status
# Should show model loaded from Dockerfile (initial state)

# This confirms volumes were properly storing new data
```

**Expected Result:** ✅ Data resets to initial state (confirms volumes work)

## Volume Inspection Commands

### List All Volumes

```bash
# Show all Mailguard volumes
docker volume ls | grep mailguard

# Expected output:
# mailguard-mongo-data
# mailguard-mongo-config
# mailguard-ml-models
# mailguard-ml-datasets
```

### Inspect Volume Details

```bash
# Show volume metadata and mount point
docker volume inspect mailguard-ml-models

# Output shows:
# - Name
# - Driver
# - Mountpoint (on host filesystem)
# - Created timestamp
```

### Check Volume Usage

```bash
# See disk space used by volumes
docker system df -v

# Or for specific volume:
docker run --rm -v mailguard-ml-models:/data alpine du -sh /data
```

### List Files in Volume

```bash
# MongoDB data files
docker run --rm -v mailguard-mongo-data:/data alpine ls -lh /data

# ML models
docker run --rm -v mailguard-ml-models:/data alpine ls -lh /data

# Training datasets
docker run --rm -v mailguard-ml-datasets:/data alpine ls -lh /data
```

## Volume Backup and Restore

### Backup ML Models

```bash
# Create backup tarball
docker run --rm \
  -v mailguard-ml-models:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/ml-models-backup.tar.gz -C /data .

# Result: ml-models-backup.tar.gz in current directory
```

### Restore ML Models

```bash
# Restore from backup tarball
docker run --rm \
  -v mailguard-ml-models:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/ml-models-backup.tar.gz -C /data

# Restart ML service to load restored models
docker compose restart ml-service
```

### Backup MongoDB Data

```bash
# Using mongodump (recommended)
docker exec mailguard-mongo mongodump \
  --username=admin \
  --password=YOUR_PASSWORD \
  --authenticationDatabase=admin \
  --db=mailguard \
  --out=/backup

# Copy backup from container to host
docker cp mailguard-mongo:/backup ./mongodb-backup

# Or create volume tarball
docker run --rm \
  -v mailguard-mongo-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongo-data-backup.tar.gz -C /data .
```

### Restore MongoDB Data

```bash
# Copy backup to container
docker cp ./mongodb-backup mailguard-mongo:/backup

# Restore using mongorestore
docker exec mailguard-mongo mongorestore \
  --username=admin \
  --password=YOUR_PASSWORD \
  --authenticationDatabase=admin \
  /backup

# Or restore from volume tarball
docker run --rm \
  -v mailguard-mongo-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mongo-data-backup.tar.gz -C /data
```

## Scheduled Backups

### Automated Backup Script (PowerShell)

Save as `backup-volumes.ps1`:

```powershell
#!/usr/bin/env pwsh
param(
    [string]$BackupDir = ".\backups",
    [string]$MongoPassword = "change_this_password"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $BackupDir $timestamp

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

Write-Host "Starting backup to: $backupPath" -ForegroundColor Cyan

# Backup MongoDB
Write-Host "Backing up MongoDB..." -ForegroundColor Yellow
docker exec mailguard-mongo mongodump `
    --username=admin `
    --password=$MongoPassword `
    --authenticationDatabase=admin `
    --db=mailguard `
    --out=/backup

docker cp mailguard-mongo:/backup "$backupPath\mongodb"
docker exec mailguard-mongo rm -rf /backup
Write-Host "✓ MongoDB backup complete" -ForegroundColor Green

# Backup ML models
Write-Host "Backing up ML models..." -ForegroundColor Yellow
docker run --rm `
    -v mailguard-ml-models:/data `
    -v "$($backupPath):/backup" `
    alpine tar czf /backup/ml-models.tar.gz -C /data .
Write-Host "✓ ML models backup complete" -ForegroundColor Green

# Backup datasets
Write-Host "Backing up datasets..." -ForegroundColor Yellow
docker run --rm `
    -v mailguard-ml-datasets:/data `
    -v "$($backupPath):/backup" `
    alpine tar czf /backup/ml-datasets.tar.gz -C /data .
Write-Host "✓ Datasets backup complete" -ForegroundColor Green

Write-Host "`n=== Backup Complete ===" -ForegroundColor Cyan
Write-Host "Location: $backupPath"
```

**Run manually:**
```bash
pwsh backup-volumes.ps1 -MongoPassword "YOUR_PASSWORD"
```

**Schedule with Windows Task Scheduler:**
- Action: `pwsh.exe`
- Arguments: `-File "C:\path\to\backup-volumes.ps1" -MongoPassword "YOUR_PASSWORD"`
- Trigger: Daily at 2:00 AM

## Troubleshooting

### Issue: Models Not Persisting

**Symptoms:** After container restart, model version resets to initial state

**Diagnosis:**
```bash
# Check if MODEL_DIR is set correctly
docker exec mailguard-ml env | grep MODEL_DIR
# Should output: MODEL_DIR=/app/models

# Check if volume is mounted
docker inspect mailguard-ml --format='{{json .Mounts}}' | ConvertFrom-Json | Where-Object {$_.Destination -eq "/app/models"}

# Check if models are in volume
docker exec mailguard-ml ls -la /app/models/
```

**Solutions:**
1. Verify `docker-compose.yml` has volume mounted: `ml-models:/app/models`
2. Verify `MODEL_DIR=/app/models` environment variable is set
3. Check volume exists: `docker volume ls | grep ml-models`

### Issue: Training Datasets Not Found

**Symptoms:** Dataset build fails, can't write to /app/datasets

**Diagnosis:**
```bash
# Check if DATASET_DIR is set
docker exec mailguard-ml env | grep DATASET_DIR

# Check volume mount
docker inspect mailguard-ml --format='{{json .Mounts}}' | ConvertFrom-Json | Where-Object {$_.Destination -eq "/app/datasets"}

# Check directory permissions
docker exec mailguard-ml ls -ld /app/datasets
```

**Solutions:**
1. Verify volume mounted in docker-compose.yml
2. Verify `DATASET_DIR=/app/datasets` environment variable
3. Check directory is writable: `docker exec mailguard-ml touch /app/datasets/test`

### Issue: MongoDB Data Lost

**Symptoms:** Users/emails disappear after restart

**Diagnosis:**
```bash
# Check if volume is mounted
docker inspect mailguard-mongo --format='{{json .Mounts}}' | ConvertFrom-Json | Where-Object {$_.Destination -eq "/data/db"}

# Check volume exists
docker volume ls | grep mongo-data

# Check if data directory has files
docker exec mailguard-mongo ls -lh /data/db/
```

**Solutions:**
1. Never use `docker compose down -v` in production (removes volumes!)
2. Verify volume mounted in docker-compose.yml: `mongo-data:/data/db`
3. Restore from backup if data was lost

### Issue: Volume Permissions Error

**Symptoms:** "Permission denied" errors when writing to volumes

**Diagnosis:**
```bash
# Check volume ownership
docker exec mailguard-ml ls -ld /app/models /app/datasets

# Check process user
docker exec mailguard-ml whoami
```

**Solutions:**
```bash
# Fix permissions (run as root)
docker exec -u root mailguard-ml chown -R 1000:1000 /app/models /app/datasets
```

## Best Practices

1. **Never use `docker compose down -v` in production** - This deletes all volumes!
2. **Schedule regular backups** - Automate backups of critical volumes
3. **Test restores regularly** - Verify backups are actually restorable
4. **Monitor volume usage** - Use `docker system df -v` to track growth
5. **Use named volumes** - Never use bind mounts for production data
6. **Document backup strategy** - Include in runbook/disaster recovery plan
7. **Separate data and code** - Models/data in volumes, code in container layers
8. **Version control metadata** - Track model versions and training history

## Volume Migration

### Moving to New Host

```bash
# On old host: Export volumes
docker run --rm \
  -v mailguard-ml-models:/data \
  alpine tar cz -C /data . > ml-models.tar.gz

# Transfer to new host (scp, rsync, etc.)
scp ml-models.tar.gz newhost:/tmp/

# On new host: Import volumes
docker volume create mailguard-ml-models
docker run --rm -i \
  -v mailguard-ml-models:/data \
  alpine tar xz -C /data < /tmp/ml-models.tar.gz
```

## Monitoring

### Volume Health Check Script

Save as `check-volumes.ps1`:

```powershell
#!/usr/bin/env pwsh

Write-Host "=== Volume Health Check ===" -ForegroundColor Cyan

# Check all volumes exist
$volumes = @("mailguard-mongo-data", "mailguard-mongo-config", "mailguard-ml-models", "mailguard-ml-datasets")

foreach ($vol in $volumes) {
    $exists = docker volume ls --format "{{.Name}}" | Select-String -Pattern "^$vol$"
    if ($exists) {
        $size = docker run --rm -v "${vol}:/data" alpine du -sh /data 2>$null
        Write-Host "✓ $vol : $size" -ForegroundColor Green
    } else {
        Write-Host "✗ $vol : NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`n=== Volume Mounts ===" -ForegroundColor Cyan
docker compose ps --format json | ConvertFrom-Json | ForEach-Object {
    Write-Host "$($_.Service):"
    docker inspect $_.Name --format='{{range .Mounts}}{{.Source}} → {{.Destination}}{{"\n"}}{{end}}'
}
```

Run: `pwsh check-volumes.ps1`

## Summary

✅ **4 persistent volumes** ensure data survives container restarts
✅ **Environment variables** configure volume paths (MODEL_DIR, DATASET_DIR)
✅ **Backwards compatible** with local development (uses current directory if no volumes)
✅ **Backup/restore scripts** provided for disaster recovery
✅ **Testing procedures** verify persistence works correctly
