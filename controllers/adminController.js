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
  
  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.admin.id,
    { username, email },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      admin: updatedAdmin
    }
  });
});