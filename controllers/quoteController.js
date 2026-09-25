const Quote = require('../models/Quote');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.create(req.body);
  res.status(201).json({
    status: 'success',
    message: req.t('quote.created'),
    data: { quote }
  });
});

exports.getAllQuotes = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const quotes = await Quote.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Quote.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: quotes.length,
    data: {
      quotes,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    }
  });
});

exports.getQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return next(new AppError(req.t('quote.notFound'), 404));

  res.status(200).json({ status: 'success', data: { quote } });
});

exports.updateQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!quote) return next(new AppError(req.t('quote.notFound'), 404));

  res.status(200).json({ status: 'success', data: { quote } });
});

exports.deleteQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.findByIdAndDelete(req.params.id);
  if (!quote) return next(new AppError(req.t('quote.notFound'), 404));

  res.status(200).json({ status: 'success', message: 'Quote deleted' });
});