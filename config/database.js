const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Auto-remove the stale slug_1 index if it exists in MongoDB
    try {
      const collection = conn.connection.collection('projects');
      const indexes = await collection.indexes();
      const hasStaleSlugIndex = indexes.some(idx => idx.name === 'slug_1');
      if (hasStaleSlugIndex) {
        await collection.dropIndex('slug_1');
        console.log('✅ Successfully dropped stale slug_1 index from projects collection');
      }
    } catch (indexErr) {
      // Index already dropped or collection is new
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose error:', err.message));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;