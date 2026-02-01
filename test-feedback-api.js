/**
 * Test script for Feedback API
 * Tests the POST /api/feedback endpoint
 * 
 * Before running:
 * 1. Make sure backend server is running (node backend/server.js)
 * 2. Have a valid JWT token (login first)
 * 3. Have a classified email ID
 * 
 * Run: node test-feedback-api.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testEmailId = '';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

/**
 * Helper function to print test results
 */
function printResult(testName, success, details = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  console.log(`${color}${icon} ${testName}${colors.reset}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

/**
 * Step 1: Login to get auth token
 */
async function login() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 1: Authentication');
  console.log('='.repeat(50) + '\n');

  try {
    // Try to register (might fail if user exists - that's ok)
    console.log('📝 Attempting to register test user...');
    await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log('   User registered');
  } catch (error) {
    console.log('   User already exists (continuing...)');
  }

  try {
    // Login
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });

    authToken = response.data.token;
    printResult('Login successful', true, `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    printResult('Login failed', false, error.response?.data?.error || error.message);
    return false;
  }
}

/**
 * Step 2: Get or create a test email
 */
async function getTestEmail() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 2: Get Test Email');
  console.log('='.repeat(50) + '\n');

  try {
    // Fetch classified emails
    console.log('📧 Fetching classified emails...');
    const response = await axios.get(`${BASE_URL}/api/emails/classified`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.emails && response.data.emails.length > 0) {
      testEmailId = response.data.emails[0].email._id;
      printResult('Found classified email', true, `Email ID: ${testEmailId}`);
      console.log(`   Subject: ${response.data.emails[0].email.subject}`);
      console.log(`   Prediction: ${response.data.emails[0].prediction}`);
      return true;
    } else {
      printResult('No classified emails found', false, 
        'Please fetch and classify some emails first using:\n' +
        '   POST /api/gmail/fetch\n' +
        '   POST /api/emails/classify'
      );
      return false;
    }
  } catch (error) {
    printResult('Failed to get emails', false, error.response?.data?.error || error.message);
    return false;
  }
}

/**
 * Step 3: Test submitting feedback
 */
async function testSubmitFeedback() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 3: Submit Feedback');
  console.log('='.repeat(50) + '\n');

  try {
    console.log('📝 Submitting feedback...');
    const response = await axios.post(
      `${BASE_URL}/api/feedback`,
      {
        emailId: testEmailId,
        correctLabel: 'legitimate',
        notes: 'This is a test feedback submission'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    printResult('Feedback submitted', true);
    console.log('   Response:', JSON.stringify(response.data.feedback, null, 2));
    return true;
  } catch (error) {
    printResult('Feedback submission failed', false, 
      error.response?.data?.error || error.message
    );
    return false;
  }
}

/**
 * Step 4: Test updating existing feedback
 */
async function testUpdateFeedback() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 4: Update Existing Feedback');
  console.log('='.repeat(50) + '\n');

  try {
    console.log('📝 Updating feedback...');
    const response = await axios.post(
      `${BASE_URL}/api/feedback`,
      {
        emailId: testEmailId,
        correctLabel: 'phishing',
        notes: 'Changed my mind - this looks like phishing'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    printResult('Feedback updated', true);
    console.log('   Response:', JSON.stringify(response.data.feedback, null, 2));
    return true;
  } catch (error) {
    printResult('Feedback update failed', false, 
      error.response?.data?.error || error.message
    );
    return false;
  }
}

/**
 * Step 5: Get user's feedback
 */
async function testGetFeedback() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 5: Get User Feedback');
  console.log('='.repeat(50) + '\n');

  try {
    console.log('📊 Fetching user feedback...');
    const response = await axios.get(`${BASE_URL}/api/feedback`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    printResult('Feedback retrieved', true, `Found ${response.data.count} feedback entries`);
    if (response.data.count > 0) {
      console.log('   Latest feedback:', JSON.stringify(response.data.feedbacks[0], null, 2));
    }
    return true;
  } catch (error) {
    printResult('Failed to get feedback', false, 
      error.response?.data?.error || error.message
    );
    return false;
  }
}

/**
 * Step 6: Get feedback statistics
 */
async function testGetStats() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 6: Get Feedback Statistics');
  console.log('='.repeat(50) + '\n');

  try {
    console.log('📊 Fetching statistics...');
    const response = await axios.get(`${BASE_URL}/api/feedback/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    printResult('Statistics retrieved', true);
    console.log('   User Stats:', JSON.stringify(response.data.stats.user, null, 2));
    console.log('   Global Stats:', JSON.stringify(response.data.stats.global, null, 2));
    return true;
  } catch (error) {
    printResult('Failed to get stats', false, 
      error.response?.data?.error || error.message
    );
    return false;
  }
}

/**
 * Step 7: Test validation errors
 */
async function testValidation() {
  console.log('\n' + '='.repeat(50));
  console.log('STEP 7: Test Validation');
  console.log('='.repeat(50) + '\n');

  // Test 1: Missing emailId
  try {
    console.log('🧪 Test missing emailId...');
    await axios.post(
      `${BASE_URL}/api/feedback`,
      { correctLabel: 'phishing' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    printResult('Should have failed with missing emailId', false);
  } catch (error) {
    if (error.response?.status === 400) {
      printResult('Correctly rejected missing emailId', true, 
        error.response.data.error
      );
    }
  }

  // Test 2: Invalid correctLabel
  try {
    console.log('🧪 Test invalid correctLabel...');
    await axios.post(
      `${BASE_URL}/api/feedback`,
      { emailId: testEmailId, correctLabel: 'spam' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    printResult('Should have failed with invalid label', false);
  } catch (error) {
    if (error.response?.status === 400) {
      printResult('Correctly rejected invalid label', true, 
        error.response.data.error
      );
    }
  }

  // Test 3: Invalid emailId
  try {
    console.log('🧪 Test invalid emailId...');
    await axios.post(
      `${BASE_URL}/api/feedback`,
      { emailId: '000000000000000000000000', correctLabel: 'phishing' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    printResult('Should have failed with invalid emailId', false);
  } catch (error) {
    if (error.response?.status === 404) {
      printResult('Correctly rejected invalid emailId', true, 
        error.response.data.error
      );
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + colors.blue + '╔═══════════════════════════════════════════════════╗');
  console.log('║       FEEDBACK API TEST SUITE                    ║');
  console.log('╚═══════════════════════════════════════════════════╝' + colors.reset + '\n');

  console.log(`Testing API at: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  // Run tests in sequence
  const step1 = await login();
  if (!step1) return;

  const step2 = await getTestEmail();
  if (!step2) return;

  await testSubmitFeedback();
  await testUpdateFeedback();
  await testGetFeedback();
  await testGetStats();
  await testValidation();

  console.log('\n' + colors.blue + '='.repeat(50));
  console.log('ALL TESTS COMPLETED!');
  console.log('='.repeat(50) + colors.reset + '\n');

  console.log('💡 You can also test with Postman or curl:');
  console.log('\n' + colors.yellow + 'curl -X POST http://localhost:5000/api/feedback \\');
  console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"emailId": "YOUR_EMAIL_ID", "correctLabel": "phishing"}\'' + colors.reset + '\n');
}

// Run the tests
runTests().catch(error => {
  console.error(colors.red + '❌ Test suite failed:' + colors.reset, error.message);
});
