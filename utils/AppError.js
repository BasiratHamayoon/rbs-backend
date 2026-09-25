class AppError extends Error {
  constructor(message, statusCode, translationKey = null, translationVars = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.translationKey = translationKey;
    this.translationVars = translationVars;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;