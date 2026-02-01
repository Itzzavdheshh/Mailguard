// Test script for Classification model
// Run with: node test-classification-model.js

const mongoose = require('mongoose');
const Classification = require('./backend/models/Classification');
const Email = require('./backend/models/Email');
require('dotenv').config();

async function testClassificationModel() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mailguard');
    console.log('✅ Connected to MongoDB\n');

    // Find an existing email or create a dummy one
    let email = await Email.findOne();
    if (!email) {
      console.log('📧 No emails found, creating test email...');
      email = await Email.create({
        userId: new mongoose.Types.ObjectId(),
        messageId: 'test-message-' + Date.now(),
        subject: 'Test Email for Classification',
        from: 'test@example.com',
        body: 'This is a test email',
        receivedDate: new Date()
      });
      console.log('✅ Test email created:', email._id);
    } else {
      console.log('✅ Using existing email:', email._id);
    }

    // Check if classification already exists
    const existingClassification = await Classification.findOne({ emailId: email._id });
    if (existingClassification) {
      console.log('\n⚠️  Classification already exists for this email');
      console.log('Deleting existing classification...');
      await Classification.deleteOne({ emailId: email._id });
    }

    // Create a test classification
    console.log('\n📊 Creating test classification...');
    const classification = await Classification.create({
      emailId: email._id,
      prediction: 'safe',
      confidence: 0.85,
      probabilities: {
        safe: 0.85,
        phishing: 0.15
      }
    });

    console.log('✅ Classification saved:', {
      id: classification._id,
      emailId: classification.emailId,
      prediction: classification.prediction,
      confidence: classification.confidence
    });

    // Test querying
    console.log('\n🔍 Testing query with populate...');
    const found = await Classification.findById(classification._id).populate('emailId');
    console.log('✅ Found classification with email:', {
      classification: found.prediction,
      emailSubject: found.emailId?.subject
    });

    // Test statistics
    console.log('\n📈 Testing statistics...');
    const stats = await Classification.aggregate([
      {
        $group: {
          _id: '$prediction',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);
    console.log('✅ Statistics:', stats);

    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testClassificationModel();
