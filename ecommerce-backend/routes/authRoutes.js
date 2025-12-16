const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Регистрация нового пользователя
router.post('/register', authController.register);

// Авторизация пользователя
router.post('/login', authController.login);

// Получение информации о текущем пользователе (требует аутентификации)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;

