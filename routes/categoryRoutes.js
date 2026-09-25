const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');
const {
  getAllCategories, getCategory, createCategory,
  updateCategory, deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategory);

router.use(protect, restrictTo('admin', 'super-admin'));

router.post('/', validateCategory, createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;