# ⚡ Quick Start Guide - Clerk Authentication

## Step 1: Get Clerk API Keys (5 minutes)

1. **Sign up for Clerk**
   - Go to https://clerk.com
   - Click "Start Building for Free"
   - Sign up with your email or GitHub

2. **Create an Application**
   - After login, click "Add application"
   - Name it "Mailguard" (or any name you like)
   - Click "Create application"

3. **Copy Your API Keys**
   - You'll see your API keys immediately
   - Copy the **Publishable key** (starts with `pk_test_`)
   - Copy the **Secret key** (starts with `sk_test_`)

## Step 2: Configure Your Environment (2 minutes)

### Backend Configuration

1. Create `backend/.env` file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and add your Clerk Secret Key:
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```

3. Add other required variables (if you have them):
   ```env
   MONGO_URI=mongodb://localhost:27017/mailguard
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Frontend Configuration

1. Create `frontend/.env` file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env` and add your Clerk Publishable Key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

## Step 3: Configure Clerk Dashboard (1 minute)

1. In your Clerk dashboard, go to **Configure** → **Paths**

2. Set these paths:
   - Sign-in path: `/login`
   - Sign-up path: `/register`
   - After sign-in redirect: `/dashboard`
   - After sign-up redirect: `/dashboard`

3. Click **Save**

## Step 4: Run the Application (2 minutes)

### Start Backend
```bash
cd backend
npm install    # Only needed first time
npm start
```

You should see:
```
✅ Server is running on http://localhost:5000
```

### Start Frontend (in a new terminal)
```bash
cd frontend
npm install    # Only needed first time
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173
```

## Step 5: Test It Out! (1 minute)

1. Open http://localhost:5173
2. You should see the login page with Clerk's UI
3. Click "Sign up" to create an account
4. Enter your email and create a password
5. Verify your email (check your inbox)
6. You should be redirected to the dashboard!

## ✅ Success Checklist

- [ ] Created Clerk account
- [ ] Got API keys from Clerk dashboard
- [ ] Created backend/.env with CLERK_SECRET_KEY
- [ ] Created frontend/.env with VITE_CLERK_PUBLISHABLE_KEY
- [ ] Configured paths in Clerk dashboard
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access login page
- [ ] Can sign up with new account
- [ ] Can sign in and see dashboard

## 🎉 You're Done!

If all checkboxes are checked, you're ready to go!

## 🆘 Troubleshooting

### "Missing Clerk Publishable Key" error
- Make sure frontend/.env file exists
- Verify the key is correct (starts with pk_test_)
- Restart the frontend server

### Backend returns 401 errors
- Make sure backend/.env has correct CLERK_SECRET_KEY
- Verify the key is correct (starts with sk_test_)
- Restart the backend server

### Can't see Clerk sign-in form
- Clear your browser cache
- Make sure you're on http://localhost:5173/login
- Check browser console for errors

### Still Having Issues?
- Check [CLERK_INTEGRATION.md](./CLERK_INTEGRATION.md) for detailed docs
- Visit Clerk docs: https://clerk.com/docs
- Join Clerk Discord: https://clerk.com/discord

## 🎊 Next Steps

Now that authentication is working, you can:

1. **Enable Social Login** (Google, GitHub, etc.)
   - Go to Clerk Dashboard → Social Connections
   - Enable providers
   - That's it! They'll appear on login page

2. **Enable Multi-Factor Authentication**
   - Go to Clerk Dashboard → Multi-factor
   - Enable MFA options
   - Users can enable from their profile

3. **Customize the Look**
   - Edit appearance props in Login.jsx and Register.jsx
   - See customization guide: https://clerk.com/docs/components/customization/overview

---

**Total Setup Time: ~10 minutes** ⚡
