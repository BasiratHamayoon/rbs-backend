const Admin = require('../models/Admin');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { isStrongPassword } = require('../utils/passwordValidator');

exports.setupFirstAdmin = catchAsync(async (req, res, next) => {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    return next(new AppError('Setup already completed. You cannot create more admins this way.', 403));
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Please provide username, email, and password', 400));
  }

  if (!isStrongPassword(password)) {
    return next(new AppError(req.t('validation.passwordWeak'), 400));
  }

  const newAdmin = await Admin.create({
    username,
    email: email.toLowerCase(),
    password,
    role: 'super-admin'
  });

  res.status(201).json({
    status: 'success',
    message: 'First admin registered successfully!',
    data: {
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role
      }
    }
  });
});

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
  const updateData = {};

  if (username) {
    const existing = await Admin.findOne({ username, _id: { $ne: req.admin.id } });
    if (existing) return next(new AppError(req.t('admin.usernameExists'), 400));
    updateData.username = username;
  }

  if (email) {
    const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: req.admin.id } });
    if (existing) return next(new AppError(req.t('admin.emailExists'), 400));
    updateData.email = email.toLowerCase();
  }

  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: req.t('admin.profileUpdated'),
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
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    return next(new AppError(req.t('auth.sameOldPassword'), 400));
  }

  const admin = await Admin.findById(req.admin.id).select('+password');

  if (!(await admin.correctPassword(currentPassword, admin.password))) {
    return next(new AppError(req.t('auth.currentPasswordWrong'), 401));
  }

  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: req.t('auth.passwordChanged')
  });
});