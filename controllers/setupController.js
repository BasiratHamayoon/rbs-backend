const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Check if system needs setup (no admins exist)
exports.checkSetupStatus = catchAsync(async (req, res, next) => {
  const adminCount = await Admin.countDocuments();
  
  res.status(200).json({
    status: 'success',
    data: {
      needsSetup: adminCount === 0,
      adminCount
    }
  });
});

// First-time admin registration (only works when no admins exist)
exports.initialAdminSetup = catchAsync(async (req, res, next) => {
  // Check if any admin already exists
  const adminCount = await Admin.countDocuments();
  
  if (adminCount > 0) {
    return next(new AppError('System already has an admin. Please use admin login.', 400));
  }

  const { username, email, password, confirmPassword } = req.body;

  // Validations
  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Create first admin (automatically becomes super-admin)
  const admin = await Admin.create({
    username,
    email,
    password,
    role: 'super-admin',
    isVerified: true // First admin is auto-verified
  });

  // Don't send password back
  admin.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Admin account created successfully! You can now login.',
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    }
  });
});