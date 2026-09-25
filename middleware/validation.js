const Joi = require('joi');
const { isStrongPassword } = require('../utils/passwordValidator');

const strongPasswordValidator = (value, helpers) => {
  if (!isStrongPassword(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': req.t('validation.emailInvalid'),
      'any.required': req.t('validation.fieldRequired', { field: 'Email' })
    }),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateForgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': req.t('validation.emailInvalid')
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().custom(strongPasswordValidator).required().messages({
      'any.invalid': req.t('validation.passwordWeak')
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': req.t('auth.passwordsNotMatch')
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateChangePassword = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().custom(strongPasswordValidator).required().messages({
      'any.invalid': req.t('validation.passwordWeak')
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': req.t('auth.passwordsNotMatch')
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional().messages({
      'string.email': req.t('validation.emailInvalid')
    })
  }).min(1);

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.object({
      en: Joi.string().trim().required(),
      ar: Joi.string().trim().required()
    }).required(),
    description: Joi.object({
      en: Joi.string().allow(''),
      ar: Joi.string().allow('')
    }).optional(),
    icon: Joi.string().allow('').optional(),
    isActive: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateEnquiry = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().required(),
    message: Joi.string().required(),
    enquiryType: Joi.string().valid(
      'General Inquiry', 'Project Consultation', 'Partnership Opportunity',
      'Career Opportunities', 'Media Inquiry', 'Technical Support', 'Other'
    ).required(),
    phoneCountryCode: Joi.string().optional(),
    preferredContact: Joi.string().valid('email', 'phone', 'write', 'do not').optional(),
    preferredLanguage: Joi.string().valid('en', 'ar').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};

exports.validateQuote = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().required(),
    message: Joi.string().required(),
    projectType: Joi.string().valid('residential', 'commercial', 'renovation', 'new-construction', 'other').required(),
    budget: Joi.string().valid('under-10k', '10k-50k', '50k-100k', '100k-500k', '500k-plus').optional(),
    timeline: Joi.string().valid('immediately', '1-3 months', '3-6 months', '6-12 months', 'flexible').optional(),
    preferredLanguage: Joi.string().valid('en', 'ar').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'fail', message: error.details[0].message });
  }
  next();
};