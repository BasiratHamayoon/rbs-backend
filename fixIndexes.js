const mongoose = require('mongoose');
require('dotenv').config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const collection = mongoose.connection.collection('projects');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    for (const idx of indexes) {
      if (idx.name.includes('slug')) {
        await collection.dropIndex(idx.name);
        console.log(`🗑️ Dropped index: ${idx.name}`);
      }
    }

    console.log('✨ All problematic indexes removed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fix();