const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { sendVerificationEmail } = require('../services/emailService');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Имя пользователя или email уже используется, попробуйте снова' });
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            phone,
            emailVerificationToken
        });

        if (process.env.ENABLE_EMAIL_VERIFICATION === 'true') {
            await sendVerificationEmail(user.email, emailVerificationToken, user.firstName);
        }

        const token = generateToken(user.id);

        res.status(201).json({
            message: process.env.ENABLE_EMAIL_VERIFICATION === 'true'
                ? 'Регистрация успешна. Проверьте email для подтверждения.'
                : 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'emailVerificationToken'] }
        });

        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Токен подтверждения не предоставлен' });
        }

        const user = await User.findOne({ where: { emailVerificationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Неверный или истекший токен подтверждения' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email уже подтвержден' });
        }

        user.emailVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        res.json({ message: 'Email успешно подтвержден' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email обязателен' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email уже подтвержден' });
        }

        if (!user.emailVerificationToken) {
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            user.emailVerificationToken = emailVerificationToken;
            await user.save();
        }

        await sendVerificationEmail(user.email, user.emailVerificationToken, user.firstName);

        res.json({ message: 'Письмо с подтверждением отправлено' });
    } catch (error) {
        console.error('Resend verification email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};