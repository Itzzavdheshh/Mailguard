// Test script for Gmail Service
// NOTE: This requires a user with valid Gmail tokens in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');
const { fetchEmails } = require('./backend/services/gmailService');

console.log('==============================================');
console.log('Gmail Service Test');
console.log('==============================================\n');

async function testGmailService() {
  try {
    // Connect to MongoDB
    console.log('✓ Step 1: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('  ✅ Connected to MongoDB\n');

    // Find a user with Gmail connected
    console.log('✓ Step 2: Looking for user with Gmail connected...');
    const user = await User.findOne({ 
      gmailAccessToken: { $ne: null } 
    });

    if (!user) {
      console.log('  ⚠️  No users with Gmail connected found');
      console.log('  ℹ️  To test this:');
      console.log('     1. Start the server: npm start');
      console.log('     2. Register/Login to get JWT token');
      console.log('     3. Call GET /api/gmail/auth with token');
      console.log('     4. Visit the URL and authorize Gmail');
      console.log('     5. Run this test again\n');
      return;
    }

    console.log('  ✅ Found user:', user.email);
    console.log('  ✅ Gmail connected at:', user.gmailConnectedAt);
    console.log('');

    // Test fetchEmails function
    console.log('✓ Step 3: Fetching emails from Gmail...');
    console.log('  (This will fetch latest 5 emails as a test)\n');
    
    const emails = await fetchEmails(user, 5); // Fetch only 5 for testing

    console.log('\n✓ Step 4: Email Fetch Results');
    console.log('  ✅ Total emails fetched:', emails.length);
    console.log('');

    // Display sample emails
    if (emails.length > 0) {
      console.log('✓ Step 5: Sample Email Details\n');
      
      emails.slice(0, 3).forEach((email, index) => {
        console.log(`  📧 Email ${index + 1}:`);
        console.log(`     From: ${email.senderName} <${email.sender}>`);
        console.log(`     Subject: ${email.subject}`);
        console.log(`     Date: ${email.receivedAt.toLocaleString()}`);
        console.log(`     Body preview: ${email.body.substring(0, 100)}...`);
        console.log(`     Has attachments: ${email.metadata.hasAttachments}`);
        console.log(`     Labels: ${email.metadata.labelIds.join(', ')}`);
        console.log('');
      });

      console.log('==============================================');
      console.log('✅ Gmail Service Test Completed!');
      console.log('==============================================');
      console.log('');
      console.log('📝 Email Structure:');
      console.log('   - gmailId: Unique Gmail message ID');
      console.log('   - sender: Email address');
      console.log('   - senderName: Sender display name');
      console.log('   - subject: Email subject');
      console.log('   - body: Plain text body');
      console.log('   - htmlBody: HTML body (if available)');
      console.log('   - receivedAt: Date received');
      console.log('   - metadata: Additional info (thread, labels, etc.)');
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run test
testGmailService();
