const { Category, Product } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id'],
                required: false
            }]
        });

        const categoriesWithCount = categories.map(category => ({
            ...category.toJSON(),
            productCount: category.products.length,
            products: undefined
        }));

        res.json({ categories: categoriesWithCount });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [{
                model: Product,
                as: 'products',
                where: { isActive: true },
                required: false
            }]
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, slug, image } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: 'Name and slug are required' });
        }

        const category = await Category.create({
            name,
            description,
            slug,
            image
        });

        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Category with this slug already exists' });
        }
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, slug, image } = req.body;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.update({
            name: name || category.name,
            description: description || category.description,
            slug: slug || category.slug,
            image: image || category.image
        });

        res.json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Category with this slug or name already exists' });
        }
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const productCount = await Product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return res.status(400).json({ message: `Cannot delete category with associated ${productCount} products` });
        }

        await category.destroy();

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};