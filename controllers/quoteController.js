const Quote = require('../models/Quote');
const catchAsync = require('../utils/catchAsync');

exports.createQuote = catchAsync(async (req, res, next) => {
  const quote = await Quote.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Quote request submitted successfully!',
    data: {
      quote
    }
  });
});

exports.getAllQuotes = catchAsync(async (req, res, next) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: quotes.length,
    data: {
      quotes
    }
  });
});