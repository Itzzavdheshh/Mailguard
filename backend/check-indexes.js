const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mailguard')
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = ['emails', 'classifications', 'feedbacks', 'users'];
    
    console.log('📊 MongoDB Index Verification\n');
    
    for (const col of collections) {
      try {
        const indexes = await db.collection(col).indexes();
        console.log(`${col.toUpperCase()} (${indexes.length} indexes):`);
        indexes.forEach(idx => {
          const keys = JSON.stringify(idx.key).replace(/"/g, '');
          const unique = idx.unique ? ' [UNIQUE]' : '';
          console.log(`  ✓ ${keys}${unique}`);
        });
        console.log('');
      } catch (e) {
        console.log(`  ⚠ Collection ${col} not found (expected if empty)\n`);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
