const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    comparePrice: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Цена до скидки'
    },
    volumes: {
        type: DataTypes.JSONB,
        defaultValue: null,
        comment: 'Цены за разные объемы: { "2": 400, "3": 550, "5": 800, "10": 1500 }'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(100),
        unique: true,
        comment: 'Артикул'
    },
    slug: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true
    },
    image: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    }
}, {
    tableName: 'products',
    timestamps: true
});

module.exports = Product;
