// Test Classify Emails Endpoint
// Run with: node test-classify-endpoint.js

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function testClassifyEndpoint() {
  try {
    console.log('🧪 Testing Email Classification Endpoint\n');
    console.log('='*50);

    // Step 1: Login to get token
    console.log('\n📝 Step 1: Login');
    console.log('-'.repeat(50));
    
    let loginResponse;
    try {
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
    } catch (error) {
      // If login fails, try to register
      console.log('User not found, registering...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123'
      });
      loginResponse = registerResponse;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Logged in successfully');

    // Step 2: Check ML service health
    console.log('\n🏥 Step 2: Check ML Service Health');
    console.log('-'.repeat(50));
    try {
      const mlHealth = await axios.get('http://localhost:8000/health');
      console.log('✅ ML Service is healthy:', mlHealth.data);
    } catch (error) {
      console.log('❌ ML Service is not running!');
      console.log('Please start it with: cd ml-service && uvicorn app:app --port 8000');
      return;
    }

    // Step 3: Check stats before classification
    console.log('\n📊 Step 3: Get Stats Before Classification');
    console.log('-'.repeat(50));
    try {
      const statsBefore = await axios.get(`${BASE_URL}/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Stats:', JSON.stringify(statsBefore.data.data, null, 2));
    } catch (error) {
      console.log('Stats:', error.response?.data || error.message);
    }

    // Step 4: Classify emails
    console.log('\n🤖 Step 4: Classify Unclassified Emails');
    console.log('-'.repeat(50));
    const classifyResponse = await axios.post(`${BASE_URL}/emails/classify`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Classification completed!');
    console.log('Results:', JSON.stringify(classifyResponse.data, null, 2));

    // Step 5: Check stats after classification
    console.log('\n📊 Step 5: Get Stats After Classification');
    console.log('-'.repeat(50));
    const statsAfter = await axios.get(`${BASE_URL}/emails/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Updated Stats:', JSON.stringify(statsAfter.data.data, null, 2));

    // Step 6: Get classified emails
    console.log('\n📧 Step 6: Get Classified Emails');
    console.log('-'.repeat(50));
    const classifiedResponse = await axios.get(`${BASE_URL}/emails/classified?prediction=phishing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Phishing emails count:', classifiedResponse.data.data.count);
    if (classifiedResponse.data.data.count > 0) {
      console.log('Sample:', classifiedResponse.data.data.classifications[0]);
    }

    console.log('\n' + '='*50);
    console.log('✅ All tests passed!');
    console.log('='*50);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testClassifyEndpoint();
