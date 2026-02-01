# STEP 2 - Feedback API Implementation

## What We Built

```
┌─────────────────────────────────────────────────────────────┐
│                     FEEDBACK API FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User submits feedback
   │
   ├─→ POST /api/feedback
   │   Body: { emailId, correctLabel, notes? }
   │   Headers: Authorization: Bearer TOKEN
   │
2. Controller processes request
   │
   ├─→ Validates input (required fields, enum values)
   ├─→ Checks email exists and belongs to user
   ├─→ Fetches classification (predicted label)
   ├─→ Creates or updates feedback in MongoDB
   │
3. Returns success response
   │
   └─→ { feedback: { id, emailId, predictedLabel, correctLabel, wasCorrect } }


┌─────────────────────────────────────────────────────────────┐
│                    ADDITIONAL ENDPOINTS                       │
└─────────────────────────────────────────────────────────────┘

GET /api/feedback
├─→ Returns all feedback submitted by current user
└─→ Populated with email details

GET /api/feedback/stats
├─→ Returns user-specific statistics
└─→ Returns global statistics (all users)

DELETE /api/feedback/:id
├─→ Deletes a specific feedback entry
└─→ Only owner can delete
```

## Files Structure

```
backend/
├── controllers/
│   └── feedbackController.js  ✨ NEW
│       ├── submitFeedback()
│       ├── getUserFeedback()
│       ├── getFeedbackStats()
│       └── deleteFeedback()
│
├── routes/
│   └── feedbackRoutes.js  ✨ NEW
│       ├── POST   /
│       ├── GET    /
│       ├── GET    /stats
│       └── DELETE /:id
│
├── models/
│   └── Feedback.js  ✅ (from Step 1)
│
└── server.js  🔧 UPDATED
    └── app.use('/api/feedback', feedbackRoutes)
```

## Key Features Implemented

✅ **Submit Feedback** - Store user corrections
✅ **Update Feedback** - Modify existing feedback (same emailId)
✅ **Retrieve Feedback** - Get all user's feedback with email details
✅ **Statistics** - Track accuracy (user & global)
✅ **Delete Feedback** - Remove feedback entries
✅ **Validation** - Enum validation, required fields
✅ **Security** - Auth required, ownership checks
✅ **Error Handling** - Comprehensive error messages

## Data Flow Example

```json
// User sees wrong prediction
Classification: { 
  emailId: "abc123",
  prediction: "safe",  // ML predicted safe
  confidence: 0.85 
}

// User submits correction
POST /api/feedback
{
  "emailId": "abc123",
  "correctLabel": "phishing"  // Actually phishing!
}

// System saves feedback
Feedback: {
  emailId: "abc123",
  userId: "user456",
  predictedLabel: "legitimate",  // converted from "safe"
  correctLabel: "phishing",
  wasCorrect: false,
  usedInTraining: false,
  createdAt: "2026-02-01T..."
}

// Later: retraining will use this correction
// Model learns: this email pattern → phishing (not safe)
```

## How It Enables Reinforcement Learning

1. **Feedback Loop**: Users correct wrong predictions
2. **Data Collection**: Store corrections in database
3. **Training Data**: Export feedback as corrected labels
4. **Model Retraining**: Use corrected data to retrain
5. **Model Improvement**: New model uses learned corrections
6. **Continuous Learning**: Cycle repeats with new feedback

---

## Next Steps (Step 3)

With feedback stored, we can now:
- Build dataset from original emails + feedback corrections
- Use corrected labels for retraining
- Improve model accuracy over time

This simulates reinforcement learning where the model learns from user feedback! 🚀
