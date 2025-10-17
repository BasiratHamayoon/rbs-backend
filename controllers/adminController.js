const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAdminProfile = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    }
  });
});

exports.updateAdminProfile = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;
  
  // Check if username or email already exists (excluding current admin)
  if (username) {
    const existingAdmin = await Admin.findOne({ 
      username, 
      _id: { $ne: req.admin.id } 
    });
    if (existingAdmin) {
      return next(new AppError('Username already exists', 400));
    }
  }

  if (email) {
    const existingAdmin = await Admin.findOne({ 
      email, 
      _id: { $ne: req.admin.id } 
    });
    if (existingAdmin) {
      return next(new AppError('Email already exists', 400));
    }
  }
  
  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin.id,
    { username, email },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      admin: {
        id: updatedAdmin._id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        createdAt: updatedAdmin.createdAt
      }
    }
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 1) Check if all fields are provided
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide current password, new password, and confirmation', 400));
  }

  // 2) Check if new passwords match
  if (newPassword !== confirmPassword) {
    return next(new AppError('New passwords do not match', 400));
  }

  // 3) Check if new password is different from current
  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from current password', 400));
  }

  // 4) Check if new password meets length requirement
  if (newPassword.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // 5) Get admin with password
  const admin = await Admin.findById(req.admin.id).select('+password');

  // 6) Check if current password is correct
  if (!(await admin.correctPassword(currentPassword, admin.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // 7) Update password
  admin.password = newPassword;
  await admin.save(); // This will trigger the pre-save middleware to hash the password

  // 8) Send response
  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});