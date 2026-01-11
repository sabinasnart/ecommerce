require('dotenv').config();
const { sequelize, Category, Product, User } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const perfumesDataPath = path.join(__dirname, 'perfumes-data.json');
const perfumesData = JSON.parse(fs.readFileSync(perfumesDataPath, 'utf8'));

const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ where: { email: 'admin@parfumery.ru' } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@parfumery.ru',
                password: hashedPassword,
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            });
            console.log('✓ Администратор создан (admin@parfumery.ru / admin123)');
        } else {
            console.log('✓ Администратор уже существует');
        }
    } catch (error) {
        console.error('Ошибка создания администратора:', error);
    }
};

const seedDatabase = async () => {
    try {
        console.log('Начало заполнения базы данных...\n');

        await sequelize.authenticate();
        console.log('✓ Подключение к базе данных установлено\n');

        console.log('Создание категорий (брендов)...');
        const categoriesMap = {};
        const uniqueCategories = [...new Set(perfumesData.map(p => p.category))];
        
        for (let i = 0; i < uniqueCategories.length; i++) {
            const categoryName = uniqueCategories[i];
            const slug = createSlug(categoryName);
            
            const [category, created] = await Category.findOrCreate({
                where: { slug },
                defaults: {
                    name: categoryName,
                    slug,
                    description: `Парфюмерия бренда ${categoryName}`
                }
            });
            
            categoriesMap[categoryName] = category.id;
            console.log(`${created ? '✓ Создана' : '→ Пропущена'} категория: ${categoryName}`);
        }
        console.log('');

        console.log('Создание товаров...');
        let createdCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < perfumesData.length; i++) {
            const perfume = perfumesData[i];
            const categoryId = categoriesMap[perfume.category];
            
            if (!categoryId) {
                console.log(`✗ Пропущен товар ${perfume.name}: категория не найдена`);
                skippedCount++;
                continue;
            }

            const sku = `SKU-${String(i + 1).padStart(3, '0')}`;
            const slug = `product-${String(i + 1).padStart(3, '0')}-${createSlug(perfume.name)}`;
            
            const volumes = {
                '2': perfume.price2ml,
                '3': perfume.price3ml,
                '5': perfume.price5ml,
                '10': perfume.price10ml
            };

            const price = perfume.price2ml;

            const [product, created] = await Product.findOrCreate({
                where: { slug },
                defaults: {
                    name: perfume.name,
                    description: `Эксклюзивный аромат от ${perfume.category}. Доступен в объемах 2мл, 3мл, 5мл и 10мл.`,
                    price,
                    volumes,
                    stock: Math.floor(Math.random() * 30) + 10,
                    sku,
                    slug,
                    image: [perfume.image],
                    categoryId
                }
            });

            if (created) {
                createdCount++;
                console.log(`✓ Создан товар: ${perfume.name} (${sku})`);
            } else {
                skippedCount++;
                console.log(`→ Пропущен товар: ${perfume.name} (уже существует)`);
            }
        }
        console.log('');

        await createAdmin();
        console.log('');

        console.log('═══════════════════════════════════════');
        console.log('Заполнение базы данных завершено!');
        console.log(`Создано товаров: ${createdCount}`);
        console.log(`Пропущено товаров: ${skippedCount}`);
        console.log(`Всего категорий: ${uniqueCategories.length}`);
        console.log('═══════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('Ошибка заполнения базы данных:', error);
        process.exit(1);
    }
};

seedDatabase();

