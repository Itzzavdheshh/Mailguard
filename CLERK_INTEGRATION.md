# 🔐 Clerk Authentication Integration Guide

This document explains how Mailguard has been integrated with Clerk for authentication and authorization.

## What is Clerk?

Clerk is a complete authentication and user management solution that provides:
- ✅ Secure, passwordless authentication
- ✅ Built-in UI components for sign-in/sign-up
- ✅ Multi-factor authentication (MFA)
- ✅ Social login (Google, GitHub, etc.)
- ✅ Session management
- ✅ User profile management
- ✅ Admin dashboard for user management

## Why Clerk?

Clerk is much better than custom JWT authentication because:

1. **Security**: Enterprise-grade security without managing passwords, tokens, or refresh logic
2. **User Experience**: Beautiful, customizable UI components out of the box
3. **Features**: MFA, social login, passwordless auth, and more without extra code
4. **Maintenance**: No need to maintain authentication code or worry about security patches
5. **Scalability**: Handles user management at scale
6. **Developer Experience**: Simple API, great documentation, quick integration

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your API Keys

From your Clerk dashboard:

1. Navigate to **API Keys** section
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Backend

1. Create `.env` file in the `backend/` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Add your Clerk Secret Key:
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```

### 4. Configure Frontend

1. Create `.env` file in the `frontend/` directory:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Add your Clerk Publishable Key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

### 5. Configure Clerk Dashboard

In your Clerk dashboard:

1. Go to **Paths** settings
2. Set sign-in path: `/login`
3. Set sign-up path: `/register`
4. Set after sign-in URL: `/dashboard`
5. Set after sign-up URL: `/dashboard`

### 6. Start the Application

```bash
# Start backend
cd backend
npm install
npm start

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## How It Works

### Backend Authentication

The backend uses Clerk's Node.js SDK to verify session tokens:

```javascript
// backend/middleware/authMiddleware.js
const { clerkClient } = require('@clerk/clerk-sdk-node');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const sessionClaims = await clerkClient.verifyToken(token);
  req.userId = sessionClaims.sub; // Clerk user ID
  next();
};
```

### Frontend Authentication

The frontend uses Clerk's React SDK:

```jsx
// frontend/src/main.jsx
import { ClerkProvider } from '@clerk/clerk-react';

<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
  <App />
</ClerkProvider>
```

### Protected Routes

Routes are protected using Clerk's `SignedIn` and `SignedOut` components:

```jsx
// frontend/src/App.jsx
<Route path="/dashboard" element={
  <>
    <SignedIn>
      <Dashboard />
    </SignedIn>
    <SignedOut>
      <Navigate to="/login" replace />
    </SignedOut>
  </>
} />
```

### API Requests

API requests automatically include Clerk session tokens:

```javascript
// frontend/src/services/api.js
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## User Data Model

The User model has been updated to use Clerk IDs:

```javascript
// backend/models/User.js
{
  clerkId: String,      // Primary identifier from Clerk
  email: String,        // Synced from Clerk
  name: String,         // Synced from Clerk
  // ... other fields (Gmail tokens, etc.)
}
```

## Features Available

### Out of the Box

- ✅ Email/password authentication
- ✅ Password reset
- ✅ Email verification
- ✅ Session management
- ✅ Sign out functionality

### Easy to Add (via Clerk Dashboard)

- 🔐 Multi-factor authentication (MFA)
- 🌐 Social login (Google, GitHub, Microsoft, etc.)
- 📧 Passwordless (magic links, OTP)
- 👤 User profile management
- 📊 Analytics and user insights

## Customization

### Styling

Clerk components can be customized with appearance props:

```jsx
<SignIn 
  appearance={{
    elements: {
      rootBox: 'mx-auto',
      card: 'bg-transparent shadow-none',
    },
  }}
/>
```

For full customization options, see: [Clerk Appearance Docs](https://clerk.com/docs/components/customization/overview)

### Adding Social Login

1. Go to Clerk Dashboard → **User & Authentication** → **Social Connections**
2. Enable desired providers (Google, GitHub, etc.)
3. Follow provider setup instructions
4. That's it! Social login buttons will appear automatically

### Enabling MFA

1. Go to Clerk Dashboard → **User & Authentication** → **Multi-factor**
2. Enable MFA options (SMS, Authenticator app, etc.)
3. Users can now enable MFA from their profile

## Migration from Old Auth

The following components have been removed/replaced:

- ❌ `backend/controllers/authController.js` - No longer needed
- ❌ `backend/routes/authRoutes.js` - No longer needed
- ❌ `frontend/src/context/AuthContext.jsx` - Replaced with Clerk
- ❌ `frontend/src/components/PrivateRoute.jsx` - Replaced with Clerk components
- ✅ Custom login/register forms - Replaced with Clerk components
- ✅ JWT token management - Handled by Clerk
- ✅ Password hashing - Handled by Clerk

## Troubleshooting

### "Missing Clerk Publishable Key" Error

Make sure you've created a `.env` file in the frontend directory with:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### API Returns 401 Unauthorized

1. Check that backend `.env` has correct `CLERK_SECRET_KEY`
2. Make sure you're signed in on the frontend
3. Check browser console for token errors

### Clerk Components Not Showing

1. Verify ClerkProvider is wrapping your app in `main.jsx`
2. Check that publishable key is correct
3. Clear browser cache and reload

## Resources

- 📖 [Clerk Documentation](https://clerk.com/docs)
- 🎨 [Customization Guide](https://clerk.com/docs/components/customization/overview)
- 🔧 [React SDK Reference](https://clerk.com/docs/references/react/overview)
- 🛠️ [Node.js SDK Reference](https://clerk.com/docs/references/nodejs/overview)
- 💬 [Clerk Discord Community](https://clerk.com/discord)

## Support

For issues related to:
- **Clerk Integration**: Check Clerk documentation or Discord
- **Mailguard Application**: Open an issue in the repository

---

**Note**: Remember to keep your Clerk Secret Key secure and never commit it to version control!
