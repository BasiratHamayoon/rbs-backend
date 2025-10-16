const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const { category, featured, page = 1, limit = 10 } = req.query;
  
  let filter = {};
  if (category && category !== 'all') filter.category = category;
  if (featured) filter.featured = featured === 'true';

  const projects = await Project.find(filter)
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
      currentPage: page,
      total
    }
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  let projectData;

  // Handle both formats: single JSON field OR individual fields
  if (req.body.data && req.body.data !== 'undefined') {
    // Format 1: Single JSON field (data)
    try {
      projectData = JSON.parse(req.body.data);
    } catch (parseError) {
      return next(new AppError('Invalid JSON data in data field', 400));
    }
  } else {
    // Format 2: Individual fields (what Postman is sending now)
    projectData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      duration: req.body.duration,
      size: req.body.size,
      location: req.body.location,
      client: req.body.client,
      completionDate: req.body.completionDate,
      status: req.body.status || 'completed',
      featured: req.body.featured === 'true'
    };

    // Parse arrays if they're sent as strings
    if (typeof req.body.technologies === 'string') {
      try {
        projectData.technologies = JSON.parse(req.body.technologies);
      } catch (e) {
        projectData.technologies = [req.body.technologies];
      }
    } else {
      projectData.technologies = req.body.technologies || [];
    }

    if (typeof req.body.features === 'string') {
      try {
        projectData.features = JSON.parse(req.body.features);
      } catch (e) {
        projectData.features = [req.body.features];
      }
    } else {
      projectData.features = req.body.features || [];
    }
  }

  console.log('Processed project data:', projectData);

  // Validate required fields
  const requiredFields = ['title', 'category', 'description', 'duration', 'size', 'location', 'client', 'completionDate'];
  for (const field of requiredFields) {
    if (!projectData[field]) {
      return next(new AppError(`${field} is required`, 400));
    }
  }

  // Upload images to Cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    console.log('Uploading', req.files.length, 'images to Cloudinary...');
    
    const imageUploads = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'rbs-construction/projects' },
          (error, result) => {
            if (error) {
              console.log('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Image uploaded:', result.secure_url);
              resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            }
          }
        ).end(file.buffer);
      });
    });

    try {
      images = await Promise.all(imageUploads);
      console.log('All images uploaded successfully');
    } catch (uploadError) {
      return next(new AppError('Error uploading images: ' + uploadError.message, 500));
    }
  }

  // Create project in database
  try {
    const project = await Project.create({
      ...projectData,
      images
    });

    console.log('Project created successfully:', project._id);

    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (dbError) {
    console.log('Database error:', dbError);
    return next(new AppError('Error creating project: ' + dbError.message, 500));
  }
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  let updateData = req.body;
  
  // Handle image updates if new images are uploaded
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    if (project.images.length > 0) {
      const deletePromises = project.images.map(image => 
        cloudinary.uploader.destroy(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    // Upload new images
    const imageUploads = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'rbs-construction/projects' },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        ).end(file.buffer);
      });
    });

    updateData.images = await Promise.all(imageUploads);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      project: updatedProject
    }
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  // Delete images from Cloudinary
  if (project.images.length > 0) {
    const deletePromises = project.images.map(image => 
      cloudinary.uploader.destroy(image.public_id)
    );
    await Promise.all(deletePromises);
  }

  await Project.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getProjectCategories = catchAsync(async (req, res, next) => {
  const categories = await Project.distinct('category');
  
  res.status(200).json({
    status: 'success',
    data: {
      categories
    }
  });
});