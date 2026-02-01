# STEP 2 VERIFICATION GUIDE
## Testing Feedback API

### Prerequisites
1. ✅ Backend server must be running
2. ✅ MongoDB must be connected
3. ✅ You need a JWT token (from login)
4. ✅ You need a classified email ID

---

## Quick Start

### 1. Start the Backend Server
```powershell
cd backend
node server.js
```

Server should start on http://localhost:5000

---

### 2. Get Authentication Token

**Option A: Using Postman**
- POST http://localhost:5000/api/auth/login
- Body (JSON):
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```
- Copy the `token` from response

**Option B: Using curl**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

---

### 3. Get a Classified Email ID

**Using Postman:**
- GET http://localhost:5000/api/emails/classified
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Copy an `_id` from the response

**Using curl:**
```powershell
curl -X GET http://localhost:5000/api/emails/classified `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Submit Feedback (Main Test)

**Using Postman:**
- POST http://localhost:5000/api/feedback
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body (JSON):
```json
{
  "emailId": "PASTE_EMAIL_ID_HERE",
  "correctLabel": "phishing",
  "notes": "This is definitely a phishing email"
}
```

**Using curl:**
```powershell
curl -X POST http://localhost:5000/api/feedback `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "emailId": "YOUR_EMAIL_ID",
    "correctLabel": "phishing",
    "notes": "Test feedback"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": "...",
    "emailId": "...",
    "predictedLabel": "legitimate",
    "correctLabel": "phishing",
    "wasCorrect": false,
    "createdAt": "2026-02-01T..."
  }
}
```

---

### 5. Verify in MongoDB

**Using MongoDB Compass or CLI:**
```javascript
// Connect to database
use mailguard

// Check feedback collection
db.feedbacks.find().pretty()

// You should see your feedback entry
```

---

### 6. Test Other Endpoints

**Get Your Feedback:**
```
GET http://localhost:5000/api/feedback
Headers: Authorization: Bearer YOUR_TOKEN
```

**Get Statistics:**
```
GET http://localhost:5000/api/feedback/stats
Headers: Authorization: Bearer YOUR_TOKEN
```

**Update Feedback (submit again with same emailId):**
```
POST http://localhost:5000/api/feedback
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "emailId": "SAME_ID", "correctLabel": "legitimate" }
```

---

## Validation Tests

### Test 1: Missing emailId (should fail)
```json
POST /api/feedback
{
  "correctLabel": "phishing"
}
```
Expected: 400 error - "emailId and correctLabel are required"

### Test 2: Invalid correctLabel (should fail)
```json
POST /api/feedback
{
  "emailId": "valid_id",
  "correctLabel": "spam"
}
```
Expected: 400 error - "correctLabel must be either phishing or legitimate"

### Test 3: Non-existent emailId (should fail)
```json
POST /api/feedback
{
  "emailId": "000000000000000000000000",
  "correctLabel": "phishing"
}
```
Expected: 404 error - "Email not found"

### Test 4: Without authentication (should fail)
```
POST /api/feedback
(no Authorization header)
```
Expected: 401 error - "No token provided" or similar

---

## Success Criteria

✅ Can submit feedback with valid data
✅ Feedback is saved to MongoDB
✅ Can retrieve submitted feedback
✅ Can see statistics
✅ Validation errors work correctly
✅ Authentication is enforced
✅ Cannot submit feedback for other users' emails

---

## Troubleshooting

**"No classification found"**
- Make sure the email was classified first
- Run: POST /api/emails/classify

**"Email not found"**
- Check the emailId is correct
- Verify the email exists in the database

**"You can only provide feedback on your own emails"**
- You're trying to give feedback on someone else's email
- Use your own email IDs

**401 Unauthorized**
- Token is missing or invalid
- Login again to get a fresh token
