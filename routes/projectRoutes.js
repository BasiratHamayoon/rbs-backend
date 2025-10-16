const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProjectImages } = require('../middleware/upload');
const { validateProject } = require('../middleware/validation');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectCategories
} = require('../controllers/projectController');

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/categories', getProjectCategories);
router.get('/:id', getProject);

// Protected routes (Admin only)
router.use(protect, restrictTo('admin'));

router.post('/', uploadProjectImages, validateProject, createProject);
router.patch('/:id', uploadProjectImages, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;