/**
 * AUTOMATIC MODEL RETRAINING SCHEDULER
 * 
 * This job runs automatically to retrain the phishing detection model
 * using accumulated user feedback. It ensures the model continuously
 * improves based on real-world corrections.
 * 
 * Schedule: Every night at 2:00 AM (default)
 * Can be configured via environment variable: RETRAIN_SCHEDULE
 * 
 * Cron Format: "minute hour day month weekday"
 * Examples:
 *   - "0 2 * * *" = 2:00 AM every day
 *   - "* /1 * * * *" = Every minute (for testing, remove space)
 *   - "0 * /6 * * *" = Every 6 hours (remove space)
 */

const cron = require('node-cron');
const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const RETRAIN_SCHEDULE = process.env.RETRAIN_SCHEDULE || '0 2 * * *'; // Default: 2 AM daily

// For testing: set to '*/1 * * * *' (every minute)
// For production: use '0 2 * * *' (2 AM daily)

/**
 * Execute the retraining process
 * Calls the backend admin endpoint to trigger retraining
 */
async function executeRetraining() {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 SCHEDULED RETRAINING STARTED`);
  console.log(`   Time: ${timestamp}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Check if backend is available
    console.log('📡 Step 1: Checking backend availability...');
    await axios.get(`${BACKEND_URL}/api/admin/retrain/status`, {
      timeout: 10000 // 10 second timeout
    });
    console.log('✅ Backend is available\n');

    // Step 2: Trigger retraining
    console.log('🚀 Step 2: Triggering model retraining...');
    const response = await axios.post(
      `${BACKEND_URL}/api/admin/retrain`,
      {
        dataFile: 'training.csv',
        modelType: 'random_forest',
        scheduledRun: true // Flag to indicate this is automated
      },
      {
        timeout: 300000 // 5 minute timeout for retraining
      }
    );

    // Step 3: Check results
    if (response.data.success) {
      console.log('\n✅ RETRAINING COMPLETED SUCCESSFULLY!');
      console.log(`   Duration: ${response.data.duration || 'N/A'}`);
      console.log(`   Timestamp: ${response.data.timestamp}`);
      
      if (response.data.trainingMetrics) {
        console.log('\n📊 Training Metrics:');
        console.log(`   Accuracy: ${response.data.trainingMetrics.accuracy || 'N/A'}`);
        console.log(`   Samples: ${response.data.trainingMetrics.samples || 'N/A'}`);
      }
    } else {
      console.error('❌ Retraining failed:', response.data.message);
    }

  } catch (error) {
    console.error('\n❌ SCHEDULED RETRAINING FAILED!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Error: Backend service not available');
      console.error(`   URL: ${BACKEND_URL}`);
    } else if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.message}`);
    } else if (error.request) {
      console.error('   Error: No response from backend (timeout or network issue)');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    console.error(`\n   Stack trace: ${error.stack}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`   Next scheduled run: ${getNextRun()}`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Get the next scheduled run time (approximation)
 */
function getNextRun() {
  const now = new Date();
  
  // Parse schedule to estimate next run
  if (RETRAIN_SCHEDULE === '0 2 * * *') {
    const next = new Date(now);
    next.setHours(2, 0, 0, 0);
    
    // If 2 AM today has passed, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toLocaleString();
  } else if (RETRAIN_SCHEDULE.startsWith('*/')) {
    // Every N minutes
    const minutes = parseInt(RETRAIN_SCHEDULE.split('/')[1]);
    const next = new Date(now.getTime() + minutes * 60000);
    return next.toLocaleString();
  } else {
    return 'See cron schedule: ' + RETRAIN_SCHEDULE;
  }
}

/**
 * Initialize and start the scheduler
 */
function startScheduler() {
  console.log('\n' + '='.repeat(60));
  console.log('⏰ AUTOMATIC RETRAINING SCHEDULER INITIALIZED');
  console.log('='.repeat(60));
  console.log(`   Schedule: ${RETRAIN_SCHEDULE}`);
  console.log(`   Backend URL: ${BACKEND_URL}`);
  console.log(`   Current time: ${new Date().toLocaleString()}`);
  console.log(`   Next run: ${getNextRun()}`);
  console.log('='.repeat(60) + '\n');

  // Validate cron expression
  if (!cron.validate(RETRAIN_SCHEDULE)) {
    console.error('❌ ERROR: Invalid cron schedule expression!');
    console.error(`   Schedule: ${RETRAIN_SCHEDULE}`);
    console.error('   Using default: 0 2 * * * (2 AM daily)');
    return null;
  }

  // Create and start the cron job
  const job = cron.schedule(
    RETRAIN_SCHEDULE,
    executeRetraining,
    {
      scheduled: true,
      timezone: "America/New_York" // Adjust to your timezone
    }
  );

  console.log('✅ Scheduler started successfully!\n');
  
  return job;
}

/**
 * Stop the scheduler
 */
function stopScheduler(job) {
  if (job) {
    job.stop();
    console.log('⏹️  Scheduler stopped');
  }
}

/**
 * Run retraining immediately (for testing)
 */
async function runNow() {
  console.log('🧪 MANUAL TRIGGER - Running retraining immediately...\n');
  await executeRetraining();
}

// Export functions
module.exports = {
  startScheduler,
  stopScheduler,
  runNow,
  executeRetraining
};

// Allow running manually for testing
// Usage: node retrainJob.js
if (require.main === module) {
  console.log('🧪 MANUAL TEST MODE\n');
  runNow().then(() => {
    console.log('\n✅ Manual test completed');
    process.exit(0);
  }).catch(err => {
    console.error('\n❌ Manual test failed:', err.message);
    process.exit(1);
  });
}
