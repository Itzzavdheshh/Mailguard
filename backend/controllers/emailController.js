// Email Controller
// Handles email classification and related operations

const Email = require('../models/Email');
const Classification = require('../models/Classification');
const mlService = require('../services/mlService');

/**
 * Classify all unclassified emails using ML service
 * POST /api/emails/classify
 */
exports.classifyEmails = async (req, res) => {
  try {
    console.log('📊 Starting email classification...');

    // Check if ML service is available
    const isHealthy = await mlService.checkHealth();
    if (!isHealthy) {
      return res.status(503).json({
        success: false,
        error: 'ML service is not available'
      });
    }

    // Find all emails that haven't been classified yet
    const classifiedEmailIds = await Classification.distinct('emailId');
    const unclassifiedEmails = await Email.find({
      _id: { $nin: classifiedEmailIds }
    }).limit(100); // Process in batches

    if (unclassifiedEmails.length === 0) {
      return res.json({
        success: true,
        message: 'No unclassified emails found',
        stats: {
          processed: 0,
          phishing: 0,
          safe: 0
        }
      });
    }

    console.log(`📧 Found ${unclassifiedEmails.length} unclassified emails`);

    // Classify each email
    const results = {
      processed: 0,
      phishing: 0,
      safe: 0,
      errors: 0
    };

    for (const email of unclassifiedEmails) {
      try {
        // Combine subject and body for better classification
        const emailText = `${email.subject || ''} ${email.body || ''}`.trim();

        if (!emailText) {
          console.log(`⏭️  Skipping email ${email._id} - no text content`);
          continue;
        }

        // Get prediction from ML service
        console.log(`🤖 Classifying email: ${email.subject?.substring(0, 50) || 'No subject'}...`);
        const prediction = await mlService.predictEmail(emailText);

        // Save classification to database
        await Classification.create({
          emailId: email._id,
          prediction: prediction.prediction,
          confidence: prediction.confidence,
          probabilities: prediction.probabilities
        });

        // Update stats
        results.processed++;
        if (prediction.prediction === 'phishing') {
          results.phishing++;
        } else {
          results.safe++;
        }

        console.log(`✅ Classified as: ${prediction.prediction} (confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);

      } catch (error) {
        console.error(`❌ Error classifying email ${email._id}:`, error.message);
        results.errors++;
      }
    }

    console.log('🎉 Classification complete!');

    res.json({
      success: true,
      message: `Successfully classified ${results.processed} emails`,
      stats: results
    });

  } catch (error) {
    console.error('❌ Classification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get classification statistics
 * GET /api/emails/stats
 */
exports.getClassificationStats = async (req, res) => {
  try {
    const stats = await Classification.aggregate([
      {
        $group: {
          _id: '$prediction',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    const totalEmails = await Email.countDocuments();
    const classifiedCount = await Classification.countDocuments();

    res.json({
      success: true,
      data: {
        totalEmails,
        classifiedCount,
        unclassifiedCount: totalEmails - classifiedCount,
        byPrediction: stats
      }
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all classified emails with predictions
 * GET /api/emails/classified
 */
exports.getClassifiedEmails = async (req, res) => {
  try {
    const { prediction, limit = 50 } = req.query;

    // Build query
    const query = {};
    if (prediction) {
      query.prediction = prediction;
    }

    const classifications = await Classification
      .find(query)
      .populate('emailId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: classifications.length,
      data: classifications
    });

  } catch (error) {
    console.error('❌ Get classified emails error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
