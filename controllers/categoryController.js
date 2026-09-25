const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const categories = await Category.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError(req.t('project.categoryNotFound'), 404));

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, icon, isActive } = req.body;

  const existing = await Category.findOne({
    $or: [
      { 'name.en': name.en },
      { 'name.ar': name.ar }
    ]
  });

  if (existing) return next(new AppError(req.t('project.categoryExists'), 400));

  const category = await Category.create({
    name,
    description,
    icon,
    isActive,
    createdBy: req.admin.id
  });

  res.status(201).json({
    status: 'success',
    message: req.t('project.categoryCreated'),
    data: { category }
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) return next(new AppError(req.t('project.categoryNotFound'), 404));

  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError(req.t('project.categoryNotFound'), 404));

  res.status(200).json({
    status: 'success',
    message: req.t('project.categoryDeleted')
  });
});