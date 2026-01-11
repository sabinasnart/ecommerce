import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>О нас</h3>
                    <li>100% оригинальная продукция</li>
                    <li>Широкий ассортимент</li>
                    <li>Низкие цены</li>
                    <li>Это всё — о MY PARFUM 07</li>
                </div>

                <div className="footer-section">
                    <h3>Навигация</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/products">Каталог</Link></li>
                        <li><Link to="/categories">Категории</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Покупателям</h3>
                    <ul className="footer-links">
                        <li><Link to="/cart">Корзина</Link></li>
                        <li><Link to="/orders">Мои заказы</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Контакты</h3>
                    <p>Email: info@parfumery.ru</p>
                    <p>Телефон: +7 (999) 123-45-67</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Интернет-магазин парфюмерии. Все права защищены.</p>
            </div>
        </footer>
    );
};

export default Footer;

