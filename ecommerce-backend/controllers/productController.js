const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// получение всех товаров
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            search,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // условия фильтрации
        const where = { isActive: true };

        if (category) {
            where.categoryId = category;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order]]
        });

        res.json({
            products,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// получение товара по id
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            }]
        });

        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        res.json({ product });
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// создание товара (только для админа)
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            comparePrice,
            stock,
            sku,
            slug,
            images,
            categoryId
        } = req.body;

        if (!name || !price || !slug || !categoryId) {
            return res.status(400).json({
                error: 'Название, цена, slug и категория обязательны'
            });
        }

        // проверка существования категории
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            comparePrice,
            stock: stock || 0,
            sku,
            slug,
            image: images || [],
            categoryId
        });

        res.status(201).json({
            message: 'Товар создан',
            product
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Товар с таким slug или SKU уже существует' });
        }
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// обновление товара (только для админа)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        // при изменении категории проверяем её существование
        if (updateData.categoryId) {
            const category = await Category.findByPk(updateData.categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }
        }

        await product.update(updateData);

        res.json({
            message: 'Товар обновлён',
            product
        });
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// удаление товара (только для админа)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        await product.update({ isActive: false });

        res.json({ message: 'Товар удалён' });
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};