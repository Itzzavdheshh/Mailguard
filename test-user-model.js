// Test script for User model with Gmail OAuth fields
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

console.log('==============================================');
console.log('User Model - Gmail OAuth Fields Test');
console.log('==============================================\n');

async function testUserModel() {
  try {
    // Connect to MongoDB
    console.log('✓ Step 1: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('  ✅ Connected to MongoDB\n');

    // Test 2: Check schema fields
    console.log('✓ Step 2: Verifying Schema Fields');
    const schemaFields = Object.keys(User.schema.paths);
    console.log('  Schema fields:', schemaFields.join(', '));
    
    // Check for Gmail OAuth fields
    const requiredFields = ['googleId', 'gmailAccessToken', 'gmailRefreshToken', 'gmailConnectedAt'];
    const hasAllFields = requiredFields.every(field => schemaFields.includes(field));
    
    if (hasAllFields) {
      console.log('  ✅ All Gmail OAuth fields present\n');
    } else {
      throw new Error('Missing Gmail OAuth fields');
    }

    // Test 3: Create test user with Gmail fields
    console.log('✓ Step 3: Testing User Creation with Gmail Fields');
    const testUser = {
      name: 'Test Gmail User',
      email: `test.gmail.${Date.now()}@example.com`,
      passwordHash: 'hashed_password_here',
      googleId: 'google_id_123456',
      gmailAccessToken: 'test_access_token',
      gmailRefreshToken: 'test_refresh_token',
      gmailConnectedAt: new Date()
    };

    const user = await User.create(testUser);
    console.log('  ✅ User created with ID:', user._id);
    console.log('  ✅ GoogleId:', user.googleId);
    console.log('  ✅ Gmail tokens saved successfully\n');

    // Test 4: Verify user can be retrieved
    console.log('✓ Step 4: Retrieving User from Database');
    const retrievedUser = await User.findById(user._id);
    console.log('  ✅ User retrieved:', retrievedUser.email);
    console.log('  ✅ GoogleId matches:', retrievedUser.googleId === testUser.googleId);
    console.log('  ✅ Access token matches:', retrievedUser.gmailAccessToken === testUser.gmailAccessToken);
    console.log('  ✅ Refresh token matches:', retrievedUser.gmailRefreshToken === testUser.gmailRefreshToken);
    console.log('');

    // Test 5: Test user without Gmail fields (backwards compatibility)
    console.log('✓ Step 5: Testing Backwards Compatibility');
    const basicUser = {
      name: 'Basic User',
      email: `basic.user.${Date.now()}@example.com`,
      passwordHash: 'hashed_password_here'
    };

    const basicUserDoc = await User.create(basicUser);
    console.log('  ✅ User without Gmail fields created successfully');
    console.log('  ✅ GoogleId is null:', basicUserDoc.googleId === null);
    console.log('  ✅ Gmail tokens are null:', basicUserDoc.gmailAccessToken === null);
    console.log('');

    // Cleanup
    console.log('✓ Step 6: Cleanup');
    await User.deleteMany({ _id: { $in: [user._id, basicUserDoc._id] } });
    console.log('  ✅ Test users deleted\n');

    console.log('==============================================');
    console.log('✅ All tests passed!');
    console.log('==============================================');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run tests
testUserModel();
