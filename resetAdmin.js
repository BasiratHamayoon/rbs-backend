const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const deleted = await Admin.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing admin(s)`);

    console.log('✨ Database cleared. You can now register a new admin via /api/admin/setup-first-admin');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();