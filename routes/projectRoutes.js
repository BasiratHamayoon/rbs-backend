const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadProjectImages } = require('../middleware/upload');
const {
  getAllProjects, getProject, createProject,
  updateProject, deleteProject
} = require('../controllers/projectController');

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProject);

router.use(protect, restrictTo('admin', 'super-admin'));

router.post('/', uploadProjectImages, createProject);
router.patch('/:id', uploadProjectImages, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;