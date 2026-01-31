# Gmail Integration API Documentation

## Overview
This document describes the Gmail OAuth integration endpoints that allow users to connect their Gmail accounts and fetch emails for phishing analysis.

---

## Authentication Flow

### 1. Initiate Gmail OAuth

**Endpoint:** `GET /api/gmail/auth`  
**Authentication:** Required (JWT token)  
**Description:** Generates an authorization URL to redirect users to Google's consent screen.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Gmail authorization URL generated. Redirect user to this URL.",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly&response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&state=USER_ID"
  }
}
```

**How to Use:**
1. Make a GET request to `/api/gmail/auth` with your JWT token
2. Extract the `authUrl` from the response
3. Redirect the user's browser to that URL
4. User will see Google's consent screen
5. After consent, Google redirects to your callback URL

---

### 2. Handle OAuth Callback

**Endpoint:** `GET /api/gmail/callback`  
**Authentication:** None (validated via state parameter)  
**Description:** Handles the OAuth callback from Google after user consent.

**Query Parameters:**
- `code` - Authorization code from Google (automatic)
- `state` - State parameter containing user ID (automatic)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Gmail connected successfully! You can now fetch emails.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "gmailConnected": true,
      "gmailConnectedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Authorization code or state parameter missing"
}
```

**Note:** This endpoint is called automatically by Google after the user authorizes. You typically redirect the browser to a success page after receiving the response.

---

### 3. Check Gmail Connection Status

**Endpoint:** `GET /api/gmail/status`  
**Authentication:** Required (JWT token)  
**Description:** Checks if the user has connected their Gmail account.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200) - Connected:**
```json
{
  "success": true,
  "data": {
    "gmailConnected": true,
    "connectedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Success (200) - Not Connected:**
```json
{
  "success": true,
  "data": {
    "gmailConnected": false,
    "connectedAt": null
  }
}
```

---

### 4. Disconnect Gmail

**Endpoint:** `DELETE /api/gmail/disconnect`  
**Authentication:** Required (JWT token)  
**Description:** Removes Gmail OAuth tokens and disconnects the account.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Gmail disconnected successfully"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Email Fetching

### 5. Fetch and Save Emails

**Endpoint:** `POST /api/gmail/fetch`  
**Authentication:** Required (JWT token)  
**Description:** Fetches emails from Gmail and saves them to the database for analysis.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `maxResults` (optional) - Number of emails to fetch (default: 20, max: 100)

**Example Request:**
```
POST /api/gmail/fetch?maxResults=50
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Emails fetched and saved successfully",
  "data": {
    "fetched": 50,
    "saved": 45,
    "duplicates": 5,
    "errors": 0,
    "totalInDatabase": 145
  }
}
```

**Response Fields:**
- `fetched` - Total emails retrieved from Gmail
- `saved` - New emails saved to database
- `duplicates` - Emails already in database (skipped)
- `errors` - Emails that failed to save
- `totalInDatabase` - Total emails in database for this user

**Response Error (400) - Gmail Not Connected:**
```json
{
  "success": false,
  "message": "Gmail not connected. Please connect Gmail first.",
  "action": "Call GET /api/gmail/auth to connect Gmail"
}
```

**Response Error (400) - Invalid maxResults:**
```json
{
  "success": false,
  "message": "maxResults must be between 1 and 100"
}
```

**Response Error (401) - Token Expired:**
```json
{
  "success": false,
  "message": "Gmail token expired. Please reconnect Gmail.",
  "action": "Call DELETE /api/gmail/disconnect then GET /api/gmail/auth"
}
```

---

## Complete Usage Example

### Step-by-Step Flow

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Initiate Gmail OAuth
```bash
curl -X GET http://localhost:5000/api/gmail/auth \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Gmail authorization URL generated. Redirect user to this URL.",
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

#### 3. Redirect User
Redirect the user's browser to the `authUrl`. They will see Google's consent screen.

#### 4. Google Redirects Back
After consent, Google redirects to:
```
http://localhost:5000/api/gmail/callback?code=AUTH_CODE&state=USER_ID
```

#### 5. Check Connection Status
```bash
curl -X GET http://localhost:5000/api/gmail/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gmailConnected": true,
    "connectedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 6. Fetch Emails
```bash
curl -X POST "http://localhost:5000/api/gmail/fetch?maxResults=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Emails fetched and saved successfully",
  "data": {
    "fetched": 20,
    "saved": 20,
    "duplicates": 0,
    "errors": 0,
    "totalInDatabase": 20
  }
}
```

#### 7. (Optional) Disconnect Gmail
```bash
curl -X DELETE http://localhost:5000/api/gmail/disconnect \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Gmail disconnected successfully"
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Missing/Invalid Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**401 Unauthorized - Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found - User Doesn't Exist:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to fetch and save emails",
  "error": "Detailed error message"
}
```

---

## Important Notes

### OAuth Scopes
The application requests the following Google OAuth scopes:
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access to Gmail

### Token Management
- **Access Tokens:** Used for API requests, expire after ~1 hour
- **Refresh Tokens:** Used to get new access tokens, valid indefinitely unless revoked
- The system automatically handles token refresh using stored refresh tokens

### Security Considerations
1. **HTTPS Required:** In production, all OAuth redirects must use HTTPS
2. **State Parameter:** Prevents CSRF attacks during OAuth flow
3. **Offline Access:** Requested to get refresh tokens for background sync
4. **Token Storage:** Tokens are encrypted and stored securely in MongoDB

### Rate Limits
- **Gmail API:** 250 quota units per user per second
- **Fetch Endpoint:** Can fetch max 100 emails per request
- **Recommendation:** Implement exponential backoff for large imports

### Duplicate Handling
- Emails are uniquely identified by their `gmailId`
- Attempting to save a duplicate returns a duplicate count, not an error
- This allows safe re-fetching without data duplication

---

## Testing with Postman

### Environment Variables
Create a Postman environment with:
```
BASE_URL = http://localhost:5000
JWT_TOKEN = (set after registration/login)
```

### Collection Structure
1. **Auth**
   - Register User
   - Login User

2. **Gmail**
   - Get Gmail Auth URL
   - Check Gmail Status
   - Fetch Emails
   - Disconnect Gmail

---

## Troubleshooting

### Issue: "Gmail not connected"
**Solution:** User needs to complete OAuth flow first
1. Call `GET /api/gmail/auth`
2. Redirect user to returned URL
3. User authorizes on Google
4. Google redirects back to callback

### Issue: "Gmail token expired"
**Solution:** Disconnect and reconnect Gmail
1. Call `DELETE /api/gmail/disconnect`
2. Call `GET /api/gmail/auth` again
3. Complete OAuth flow

### Issue: "Invalid credentials" from Google
**Solution:** Check Google Cloud Console settings
1. Verify OAuth 2.0 Client ID exists
2. Check redirect URI matches exactly
3. Ensure Gmail API is enabled
4. Verify credentials in `.env` file

### Issue: Duplicate emails being fetched
**Solution:** This is expected behavior
- Emails are stored by unique `gmailId`
- Re-fetching same emails increments duplicate count
- No data duplication occurs

---

## Next Steps (Phase 3)

The Gmail integration is now complete! Next phases will add:
- **ML Model Integration:** Classify emails as phishing/legitimate
- **Email Analysis Dashboard:** View statistics and classifications
- **Real-time Scanning:** Automatic background email fetching
- **Alert System:** Notify users of detected phishing attempts

---

## Support

For issues or questions:
1. Check the main README.md
2. Review test scripts in project root
3. Check server logs for detailed error messages
4. Verify environment variables in `.env`
