// Test Email Classification API
// Make sure both services are running:
// 1. Node backend: node backend/server.js
// 2. Python ML service: cd ml-service && uvicorn app:app --port 8000

const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

// You'll need a valid JWT token - get it from login
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testClassification() {
  console.log('🧪 Testing Email Classification API\n');
  console.log('='*50);
  console.log('Prerequisites:');
  console.log('1. Node backend running on port 5000');
  console.log('2. Python ML service running on port 8000');
  console.log('3. Valid JWT token (login first)');
  console.log('='*50 + '\n');

  try {
    // Test 1: Get stats before classification
    console.log('Test 1: Get Classification Stats (Before)');
    console.log('-'.repeat(50));
    try {
      const statsResponse = await axios.get(`${API_BASE}/emails/stats`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Stats:', statsResponse.data);
    } catch (error) {
      console.log('⚠️  Stats endpoint:', error.response?.data || error.message);
    }

    // Test 2: Classify emails
    console.log('\nTest 2: Classify Emails');
    console.log('-'.repeat(50));
    try {
      const classifyResponse = await axios.post(
        `${API_BASE}/emails/classify`,
        {},
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      console.log('✅ Classification result:', classifyResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ Error:', error.response.data);
      } else {
        console.log('❌ Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   - Backend is running: node backend/server.js');
        console.log('   - ML service is running: cd ml-service && uvicorn app:app --port 8000');
        console.log('   - You have a valid JWT token');
      }
    }

    // Test 3: Get stats after classification
    console.log('\nTest 3: Get Classification Stats (After)');
    console.log('-'.repeat(50));
    try {
      const statsResponse = await axios.get(`${API_BASE}/emails/stats`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Stats:', statsResponse.data);
    } catch (error) {
      console.log('⚠️  Stats endpoint:', error.response?.data || error.message);
    }

    // Test 4: Get classified emails
    console.log('\nTest 4: Get Classified Emails');
    console.log('-'.repeat(50));
    try {
      const emailsResponse = await axios.get(`${API_BASE}/emails/classified?limit=5`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Classified emails count:', emailsResponse.data.count);
      if (emailsResponse.data.data.length > 0) {
        console.log('Sample:', {
          subject: emailsResponse.data.data[0].emailId?.subject,
          prediction: emailsResponse.data.data[0].prediction,
          confidence: emailsResponse.data.data[0].confidence
        });
      }
    } catch (error) {
      console.log('⚠️  Get classified emails:', error.response?.data || error.message);
    }

    console.log('\n' + '='*50);
    console.log('✅ Tests complete!');
    console.log('='*50);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Check if token is set
if (TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  console.log('⚠️  Please set a valid JWT token in the test script');
  console.log('\nTo get a token:');
  console.log('1. Start the backend: node backend/server.js');
  console.log('2. Login or register a user');
  console.log('3. Copy the token from the response');
  console.log('4. Paste it in test-classify-api.js as TOKEN variable\n');
} else {
  testClassification();
}
