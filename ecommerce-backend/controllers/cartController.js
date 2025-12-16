const { Cart, Product } = require('../models');

// получение корзины пользователя
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'image', 'stock', 'isActive']
            }]
        });

        // подсчет общей суммы
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);

        res.json({
            cartItems,
            total: parseFloat(total.toFixed(2)),
            itemsCount: cartItems.length
        });
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// добавление товара в корзину
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'ID товара обязателен' });
        }

        // проверка существования товара
        const product = await Product.findByPk(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        // проверка наличия
        if (product.stock < quantity) {
            return res.status(400).json({
                error: `На складе только ${product.stock} шт.`
            });
        }

        // проверка наличия товара в корзине
        let cartItem = await Cart.findOne({
            where: { userId, productId }
        });

        if (cartItem) {
            // обновление количества
            const newQuantity = cartItem.quantity + quantity;

            if (product.stock < newQuantity) {
                return res.status(400).json({
                    error: `На складе только ${product.stock} шт.`
                });
            }

            await cartItem.update({ quantity: newQuantity });
        } else {
            // создание новой записи
            cartItem = await Cart.create({
                userId,
                productId,
                quantity
            });
        }

        // получение обновлённой корзины
        const updatedCart = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.json({
            message: 'Товар добавлен в корзину',
            cartItems: updatedCart
        });
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// обновление количества товара в корзине
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Количество должно быть больше 0' });
        }

        const cartItem = await Cart.findOne({
            where: { id, userId },
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Товар в корзине не найден' });
        }

        // проверка наличия
        if (cartItem.product.stock < quantity) {
            return res.status(400).json({
                error: `На складе только ${cartItem.product.stock} шт.`
            });
        }

        await cartItem.update({ quantity });

        res.json({
            message: 'Количество обновлено',
            cartItem
        });
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// удаление товара из корзины
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const cartItem = await Cart.findOne({
            where: { id, userId }
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Товар в корзине не найден' });
        }

        await cartItem.destroy();

        res.json({ message: 'Товар удалён из корзины' });
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// очистка корзины
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await Cart.destroy({
            where: { userId }
        });

        res.json({ message: 'Корзина очищена' });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};