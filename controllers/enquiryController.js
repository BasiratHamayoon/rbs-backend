const Enquiry = require('../models/Enquiry');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllEnquiries = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  let filter = {};
  if (status) filter.status = status;

  const enquiries = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Enquiry.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: enquiries.length,
    data: {
      enquiries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
  });
});

exports.getEnquiry = catchAsync(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return next(new AppError('No enquiry found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      enquiry
    }
  });
});

exports.createEnquiry = catchAsync(async (req, res, next) => {
  const enquiry = await Enquiry.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      enquiry
    }
  });
});

exports.updateEnquiry = catchAsync(async (req, res, next) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!enquiry) {
    return next(new AppError('No enquiry found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      enquiry
    }
  });
});

exports.deleteEnquiry = catchAsync(async (req, res, next) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

  if (!enquiry) {
    return next(new AppError('No enquiry found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getEnquiryStats = catchAsync(async (req, res, next) => {
  const stats = await Enquiry.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await Enquiry.countDocuments();
  const newEnquiries = await Enquiry.countDocuments({ status: 'new' });

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      total,
      newEnquiries
    }
  });
});