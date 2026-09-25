const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
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