const { Order, OrderItem, Cart, Product, User } = require('../models');
const { sequelize } = require('../models');

// создание заказа
exports.createOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod, notes } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Адрес доставки обязателен' });
        }

        // получение корзины пользователя
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product'
            }],
            transaction: t
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // проверка наличия товаров
        for (const item of cartItems) {
            if (!item.product.isActive) {
                await t.rollback();
                return res.status(400).json({
                    error: `Товар "${item.product.name}" недоступен`
                });
            }
            if (item.product.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    error: `Недостаточно товара "${item.product.name}" на складе`
                });
            }
        }

        // подсчет общей суммы
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);

        // генерация номера заказа
        const orderNumber = `ORD-${Date.now()}-${userId}`;

        // создание заказа
        const order = await Order.create({
            orderNumber,
            userId,
            totalAmount: totalAmount.toFixed(2),
            shippingAddress,
            paymentMethod: paymentMethod || 'cash',
            notes
        }, { transaction: t });

        // создание товаров заказа
        for (const item of cartItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price // фиксирование цены на момент заказа
            }, { transaction: t });

            // уменьшение количества на складе
            await item.product.update({
                stock: item.product.stock - item.quantity
            }, { transaction: t });
        }

        // очистка корзины
        await Cart.destroy({
            where: { userId },
            transaction: t
        });

        await t.commit();

        // получение созданного заказа с товарами
        const createdOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                as: 'orderItems',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                }]
            }]
        });

        res.status(201).json({
            message: 'Заказ создан',
            order: createdOrder
        });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера при создании заказа' });
    }
};

// получение всех заказов пользователя
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.findAll({
            where: { userId },
            include: [{
                model: OrderItem,
                as: 'orderItems',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ orders });
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// получение заказа по id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const whereCondition = isAdmin ? { id } : { id, userId };

        const order = await Order.findOne({
            where: whereCondition,
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'phone']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Ошибка получения заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// обновление статуса заказа (только для админа)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        const updateData = {};
        if (status) updateData.status = status;

        await order.update(updateData);

        res.json({
            message: 'Статус заказа обновлён',
            order
        });
    } catch (error) {
        console.error('Ошибка обновления заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// получение всех заказов (только для админа)
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: OrderItem,
                    as: 'orderItems'
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            orders,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Ошибка получения всех заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};