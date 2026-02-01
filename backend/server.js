// Import required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express app
const app = express();

// ================================================
// MIDDLEWARE CONFIGURATION
// ================================================

// Enable JSON parsing for incoming requests
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend on different domain to communicate with backend
app.use(cors());

// ================================================
// ROUTES
// ================================================

// Import route modules
const authRoutes = require('./routes/authRoutes');
const gmailRoutes = require('./routes/gmailRoutes');
const emailRoutes = require('./routes/emailRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Test route - verifies server is running
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mailguard Backend API is running successfully!'
  });
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount Gmail OAuth routes
app.use('/api/gmail', gmailRoutes);

// Mount email classification routes
app.use('/api/emails', emailRoutes);

// Mount feedback routes
app.use('/api/feedback', feedbackRoutes);

// Mount admin routes
app.use('/api/admin', adminRoutes);

// ================================================
// SERVER STARTUP
// ================================================

// Get port from environment variables or use default 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
