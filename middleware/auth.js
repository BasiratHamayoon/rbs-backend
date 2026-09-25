const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const { isStrongPassword } = require('../utils/passwordValidator');

const signToken = (id, rememberMe = false) => {
  const expiresIn = rememberMe 
    ? process.env.JWT_REMEMBER_EXPIRES_IN 
    : process.env.JWT_EXPIRES_IN;
  
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const createSendToken = (admin, statusCode, req, res, rememberMe = false) => {
  const token = signToken(admin._id, rememberMe);
  const cookieExpiryDays = rememberMe ? 30 : parseInt(process.env.JWT_COOKIE_EXPIRES_IN);

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    message: req.t('auth.loginSuccess'),
    token,
    rememberMe,
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    }
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return next(new AppError(req.t('auth.emailRequired'), 400));
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  if (!admin) {
    return next(new AppError(req.t('auth.invalidCredentials'), 401));
  }

  if (admin.isLocked()) {
    return next(new AppError('Account temporarily locked. Try again later.', 423));
  }

  if (!admin.isActive) {
    return next(new AppError('Your account has been deactivated', 403));
  }

  const isCorrect = await admin.correctPassword(password, admin.password);

  if (!isCorrect) {
    await admin.incrementLoginAttempts();
    return next(new AppError(req.t('auth.invalidCredentials'), 401));
  }

  await admin.resetLoginAttempts();
  createSendToken(admin, 200, req, res, rememberMe === true || rememberMe === 'true');
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ 
    status: 'success',
    message: req.t('auth.logoutSuccess')
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError(req.t('validation.emailInvalid'), 400));
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return next(new AppError(req.t('auth.emailNotFound'), 404));
  }

  const resetToken = admin.createPasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await new Email(admin, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: req.t('auth.resetTokenSent')
    });
  } catch (err) {
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new AppError('Please provide password and confirm password', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError(req.t('auth.passwordsNotMatch'), 400));
  }

  if (!isStrongPassword(password)) {
    return next(new AppError(req.t('validation.passwordWeak'), 400));
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!admin) {
    return next(new AppError(req.t('auth.resetTokenInvalid'), 400));
  }

  admin.password = password;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: req.t('auth.passwordResetSuccess')
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'loggedout') {
    return next(new AppError(req.t('auth.notLoggedIn'), 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin) {
    return next(new AppError(req.t('auth.adminNotExist'), 401));
  }

  if (currentAdmin.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password recently changed. Please log in again', 401));
  }

  req.admin = currentAdmin;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError(req.t('auth.noPermission'), 403));
    }
    next();
  };
};