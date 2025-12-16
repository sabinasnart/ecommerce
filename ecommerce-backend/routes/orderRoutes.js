const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Роуты для пользователей (требуют аутентификации)
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);

// Роуты для администраторов
router.get('/', authenticateToken, isAdmin, orderController.getAllOrders);

// Общие роуты (порядок важен - после специфичных роутов)
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id/status', authenticateToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;

