# STEP 6 VERIFICATION GUIDE - Backend Retrain Trigger

## Prerequisites

Before testing, ensure you have:
1. MongoDB running
2. Node.js backend ready
3. Python ML service ready

---

## Step 1: Start ML Service (Terminal 1)

Open a new terminal:
```bash
cd ml-service
python -m uvicorn app:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
==================================================
🚀 Initializing ML Service
==================================================
📦 Loading existing models...
✅ Models loaded successfully from disk
==================================================
```

✅ **ML Service running on port 8000**

---

## Step 2: Start Backend Server (Terminal 2)

Open another new terminal:
```bash
cd backend
node server.js
```

You should see:
```
MongoDB connected successfully!
Server is running on http://localhost:5000
```

✅ **Backend running on port 5000**

---

## Step 3: Login and Get Token (Terminal 3)

Open a third terminal for testing.

### Option A: Using curl (PowerShell)
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"Test123!"}'

# Save token
$token = $response.token
Write-Host "Token: $token"
```

### Option B: Using Node test script
```bash
node test-admin-retrain.js
```

This will run all tests automatically.

---

## Step 4: Check Retraining Status

```powershell
# Check status
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/retrain/status" `
  -Headers @{Authorization="Bearer $token"}
```

Expected response:
```json
{
  "success": true,
  "mlService": {
    "available": true,
    "url": "http://localhost:8000",
    "modelStatus": {
      "model_loaded": true,
      "vectorizer_exists": true,
      "model_exists": true
    }
  }
}
```

---

## Step 5: Build Dataset (Optional)

This fetches data from MongoDB and creates training.csv:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/dataset/build" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"outputFile":"training.csv"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Dataset built successfully",
  "outputFile": "training.csv"
}
```

**Note:** If you don't have data in MongoDB, this will fail. That's okay - we'll use sample data instead.

---

## Step 6: Trigger Retraining ⭐ (Main Test)

**This is the core functionality!**

```powershell
# Trigger retraining
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/retrain" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"dataFile":"sample_training.csv","modelType":"random_forest"}'
```

### What Happens:

**In Terminal 2 (Backend):**
```
🔄 Retraining request received...
📊 Configuration:
   ML Service: http://localhost:8000
   Training data: sample_training.csv
   Model type: random_forest

🔍 Step 1: Checking ML service availability...
✅ ML service is available

🚀 Step 2: Starting model retraining...
   Command: python retrain.py --data sample_training.csv --model random_forest

############################################################
# MODEL RETRAINING PIPELINE
############################################################
[... training output ...]
✅ Retraining completed successfully

🔄 Step 3: Reloading model in ML service...
✅ Model reloaded successfully

✅ Complete retraining pipeline finished successfully!
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Model retrained and reloaded successfully",
  "steps": {
    "retraining": "completed",
    "reload": "completed"
  },
  "config": {
    "dataFile": "sample_training.csv",
    "modelType": "random_forest"
  },
  "timestamp": "2026-02-01T..."
}
```

---

## Step 7: Test Prediction with New Model

```powershell
# Test prediction
Invoke-RestMethod -Uri "http://localhost:8000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text":"Congratulations! You won a million dollars!"}'
```

Expected response:
```json
{
  "prediction": "phishing",
  "confidence": 0.58,
  "probabilities": {
    "safe": 0.42,
    "phishing": 0.58
  }
}
```

✅ **Model is using the retrained version!**

---

## Step 8: Run Automated Test Suite

```bash
node test-admin-retrain.js
```

This will automatically test:
1. ✅ Backend availability
2. ✅ ML service availability
3. ✅ Authentication
4. ✅ Status check
5. ✅ Dataset building
6. ✅ Retraining trigger
7. ✅ Prediction with new model

Expected output:
```
============================================================
TEST SUMMARY
============================================================

✅ Backend Available
✅ ML Service Available
✅ Authentication
✅ Status Check
✅ Build Dataset
✅ Trigger Retraining
✅ Test Prediction

Results: 7/7 tests passed

🎉 All tests passed!

✅ Backend can trigger retraining
✅ Model reloads automatically
✅ Complete pipeline works end-to-end
```

---

## Alternative: Using Postman

### 1. Login
- **POST** `http://localhost:5000/api/auth/login`
- Body: `{"email":"test@example.com","password":"Test123!"}`
- Copy the `token` from response

### 2. Check Status
- **GET** `http://localhost:5000/api/admin/retrain/status`
- Headers: `Authorization: Bearer YOUR_TOKEN`

### 3. Trigger Retraining
- **POST** `http://localhost:5000/api/admin/retrain`
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body:
```json
{
  "dataFile": "sample_training.csv",
  "modelType": "random_forest"
}
```

Watch the backend terminal for progress!

---

## Success Criteria

✅ Backend accepts retraining request
✅ Python retraining script executes
✅ Model files are updated (check ml-service/*.pkl)
✅ ML service reload endpoint is called
✅ New model loads without service restart
✅ Predictions use the retrained model
✅ No errors in either terminal

---

## What We Achieved

🎯 **One-Click Retraining**
- Trigger from API endpoint
- No manual script execution
- Automatic model reload

🎯 **End-to-End Pipeline**
- Backend → Python script → ML service
- Complete automation
- Status tracking throughout

🎯 **Zero Downtime**
- Model updates without restart
- Continuous service availability
- Seamless deployment

---

## Integration with Full Pipeline

```
User provides feedback
  ↓
POST /api/feedback (saves to MongoDB)
  ↓
[Administrator decides to retrain]
  ↓
POST /api/admin/retrain ← YOU ARE HERE
  ├─→ Runs dataset_builder.py (if needed)
  ├─→ Runs retrain.py
  ├─→ Calls ML service /reload
  └─→ Returns success
  ↓
New model active immediately!
  ↓
Better predictions from user feedback 🎉
```

---

## Next Step (Step 7)

Schedule automatic nightly retraining using node-cron!

This will run the retraining automatically without manual intervention.
