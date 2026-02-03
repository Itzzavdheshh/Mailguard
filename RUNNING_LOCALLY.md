# Local Development - Running Status

## ✅ Services Running

### 1. MongoDB
- **Status**: Running (Docker container)
- **Port**: 27017
- **Access**: localhost:27017

### 2. Backend Server
- **Status**: Running
- **Port**: 5000
- **URL**: http://localhost:5000
- **Environment**: Development
- **MongoDB**: Connected to localhost

### 3. Frontend (Vite)
- **Status**: Running
- **Port**: 5173
- **URL**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### 4. ML Service
- **Status**: Not started (Python dependency issues)
- **Impact**: Email classification won't work until fixed
- **Workaround**: Can be fixed later or use Docker for ML service only

## 🧪 Testing Clerk Integration

### Current Setup
- **Frontend**: Using @clerk/clerk-react v5.60.0
- **Backend**: Using @clerk/clerk-sdk-node v4.13.23
- **Publishable Key**: pk_test_cHJvdmVuLWJvYXItODIuY2xlcmsuYWNjb3VudHMuZGV2JA
- **Secret Key**: Configured in backend/.env

### Test Steps
1. Open http://localhost:5173 in your browser
2. Click "Register" or "Login"
3. Use Clerk's authentication UI to sign up/sign in
4. After authentication, you should see the Dashboard
5. Check browser console for any Clerk errors

## 📧 Testing Gmail Connection

### Prerequisites
- You must be signed in with Clerk first
- Google OAuth credentials must be valid

### Test Steps
1. After signing in, go to Dashboard
2. Look for "Connect Gmail" button
3. Click the button
4. You should be redirected to Google OAuth consent screen
5. After authorization, you'll be redirected back

### Common Issues

#### Issue 1: "redirect_uri_mismatch"
**Cause**: Google Console doesn't have the correct redirect URI

**Solution**: Add to Google Cloud Console:
- Authorized redirect URIs: `http://localhost:5000/api/gmail/callback`

#### Issue 2: Gmail button not appearing
**Cause**: Frontend not properly authenticated with Clerk

**Solution**: Check browser console for Clerk errors

#### Issue 3: "User not found" after callback
**Cause**: User's Clerk ID not stored in MongoDB

**Solution**: This is expected - the backend needs to create user on first Clerk sign-in

## 🔍 Debugging

### Check Backend Logs
Look at the terminal running backend for:
- Clerk token verification logs
- Gmail OAuth flow logs
- MongoDB connection status

### Check Frontend Console
Open browser DevTools (F12) and check:
- Clerk initialization messages
- API request/response logs
- Any error messages

### Check MongoDB
You can connect to MongoDB and check users:
```bash
docker exec -it mailguard-mongo mongosh
use mailguard
db.users.find()
```

## 📝 Known Issues

1. **ML Service Python Error**
   - Not critical for testing authentication and Gmail OAuth
   - Can be fixed later or use Docker ML service

2. **User Creation on First Login**
   - Backend needs to create user in MongoDB when Clerk user first signs in
   - This might need a webhook or manual creation endpoint

3. **Next.js Code Doesn't Apply**
   - The middleware.ts and layout.tsx code you showed is for Next.js
   - This project uses React + Vite, not Next.js
   - Current implementation with ClerkProvider is correct for React

## 🎯 Next Steps

1. **Test Clerk Authentication**
   - Sign up/Sign in
   - Check if Dashboard loads
   - Verify token is sent to backend

2. **Test Gmail OAuth**
   - Click Connect Gmail
   - Complete OAuth flow
   - Check if connection succeeds

3. **Fix User Creation**
   - Backend might need endpoint to create user from Clerk data
   - Or implement Clerk webhook for user.created event

4. **Fix ML Service** (optional for now)
   - Install missing Python dependencies
   - Or use Docker for ML service only while running other services locally

## 🌐 Access URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

Happy testing! 🚀
