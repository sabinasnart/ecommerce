const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Публичные роуты (доступны всем)
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Защищенные роуты (только для администраторов)
router.post('/', authenticateToken, isAdmin, categoryController.createCategory);
router.put('/:id', authenticateToken, isAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateToken, isAdmin, categoryController.deleteCategory);

module.exports = router;

