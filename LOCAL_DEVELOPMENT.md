# Mailguard - Local Development Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally
- Python 3.8+ installed (for ML service)

## 1. Environment Setup

### Backend (.env file location: `backend/.env`)
```dotenv
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_3ctos7K9xGH527yRyiIYSSMMpD1YGk6WUNikwvIm6p

# Database (Local MongoDB)
MONGO_URI=mongodb://localhost:27017/mailguard

# Gmail OAuth
GOOGLE_CLIENT_ID=84702114664-tunt8hqgiisl9mi78kbbk36e2f8s1emq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env file location: `frontend/.env`)
```dotenv
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJvdmVuLWJvYXItODIuY2xlcmsuYWNjb3VudHMuZGV2JA

# Backend API
VITE_API_URL=http://localhost:5000
```

## 2. Start MongoDB Locally

### Option A: MongoDB Installed Locally
```powershell
# Start MongoDB service
net start MongoDB
```

### Option B: Use Docker for MongoDB Only
```powershell
docker run -d -p 27017:27017 --name mailguard-mongo mongo:latest
```

## 3. Start ML Service

```powershell
# Navigate to ml-service directory
cd ml-service

# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the ML service
python app.py
```

The ML service will run on `http://localhost:8000`

## 4. Start Backend Server

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

## 5. Start Frontend Development Server

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the frontend dev server
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

## 6. Access the Application

Open your browser and go to: `http://localhost:5173`

## Gmail OAuth Setup

To test Gmail connection:

1. **Sign in** with Clerk authentication
2. On the Dashboard, click **"Connect Gmail"**
3. You'll be redirected to Google OAuth consent screen
4. After authorization, you'll be redirected back to: `http://localhost:5000/api/gmail/callback`

### Important: Google Cloud Console Setup

Make sure in your Google Cloud Console (https://console.cloud.google.com):

1. **Authorized redirect URIs** includes:
   ```
   http://localhost:5000/api/gmail/callback
   http://localhost:3000/api/gmail/callback
   ```

2. **Authorized JavaScript origins** includes:
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:5000
   ```

## Troubleshooting

### MongoDB Connection Error
- **Issue**: `MongoNetworkError: connect ECONNREFUSED`
- **Solution**: Make sure MongoDB is running on `localhost:27017`

### Gmail OAuth "redirect_uri_mismatch"
- **Issue**: Google OAuth error about redirect URI
- **Solution**: Add `http://localhost:5000/api/gmail/callback` to Google Console

### Clerk Authentication Error
- **Issue**: "Missing Clerk Publishable Key"
- **Solution**: Make sure `VITE_CLERK_PUBLISHABLE_KEY` is in `frontend/.env`

### ML Service Error
- **Issue**: Backend can't reach ML service
- **Solution**: Make sure Python ML service is running on port 8000

## Quick Start Commands

```powershell
# Terminal 1 - MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mailguard-mongo mongo:latest

# Terminal 2 - ML Service
cd ml-service; python app.py

# Terminal 3 - Backend
cd backend; npm start

# Terminal 4 - Frontend
cd frontend; npm run dev
```

## Notes

- The frontend Vite dev server runs on port **5173** (not 3000)
- Make sure all environment variables are set correctly
- For Gmail OAuth to work locally, you need to be on `http://localhost` (not `127.0.0.1`)
