const Project = require('../models/Project');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const parseIfJSON = (value) => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
};

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const { category, featured, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (featured) filter.featured = featured === 'true';

  const projects = await Project.find(filter)
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Project.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    }
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate('category');
  if (!project) return next(new AppError(req.t('project.notFound'), 404));

  res.status(200).json({
    status: 'success',
    data: { project }
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  let projectData = {};

  if (req.body.data) {
    projectData = parseIfJSON(req.body.data);
  } else {
    projectData = {
      title: parseIfJSON(req.body.title),
      category: req.body.category,
      description: parseIfJSON(req.body.description),
      shortDescription: parseIfJSON(req.body.shortDescription),
      duration: parseIfJSON(req.body.duration),
      size: req.body.size,
      location: parseIfJSON(req.body.location),
      client: req.body.client,
      completionDate: req.body.completionDate,
      status: req.body.status || 'completed',
      featured: req.body.featured === 'true' || req.body.featured === true,
      technologies: parseIfJSON(req.body.technologies) || [],
      features: parseIfJSON(req.body.features) || { en: [], ar: [] }
    };
  }

  const categoryExists = await Category.findById(projectData.category);
  if (!categoryExists) return next(new AppError(req.t('project.categoryNotFound'), 404));

  let images = [];
  if (req.files && req.files.length > 0) {
    const uploads = req.files.map(file => new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'rbs-construction/projects' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, public_id: result.public_id });
        }
      ).end(file.buffer);
    }));
    images = await Promise.all(uploads);
  }

  const project = await Project.create({ ...projectData, images });

  res.status(201).json({
    status: 'success',
    message: req.t('project.created'),
    data: { project }
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError(req.t('project.notFound'), 404));

  let updateData = {};

  if (req.body.data) {
    updateData = parseIfJSON(req.body.data);
  } else {
    Object.keys(req.body).forEach(key => {
      updateData[key] = parseIfJSON(req.body[key]);
    });
  }

  if (req.files && req.files.length > 0) {
    if (project.images.length > 0) {
      await Promise.all(project.images.map(img => cloudinary.uploader.destroy(img.public_id)));
    }

    const uploads = req.files.map(file => new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'rbs-construction/projects' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, public_id: result.public_id });
        }
      ).end(file.buffer);
    }));
    updateData.images = await Promise.all(uploads);
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('category');

  res.status(200).json({
    status: 'success',
    message: req.t('project.updated'),
    data: { project: updated }
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError(req.t('project.notFound'), 404));

  if (project.images.length > 0) {
    await Promise.all(project.images.map(img => cloudinary.uploader.destroy(img.public_id)));
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: req.t('project.deleted')
  });
});