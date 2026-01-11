import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import '../styles/components/Header.css';

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const { updateFilters, filters } = useProduct();
    const { itemsCount } = useCart();
    const [searchValue, setSearchValue] = useState(filters.search || '');

    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/');
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ search: searchValue });
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <h1>MY PARFUM 07</h1>
                </Link>

                <nav className="header-nav">
                    <Link to="/" className="nav-link">
                        Главная
                    </Link>
                    <Link to="/products" className="nav-link">
                        Каталог
                    </Link>
                    <Link to="/cart" className="nav-link cart-link-nav">
                        Корзина
                        {itemsCount > 0 && (
                            <span className="cart-count-badge">{itemsCount}</span>
                        )}
                    </Link>
                </nav>

                <form className="header-search" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Поиск..."
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                    <button type="submit" className="search-button">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </form>

                <div className="header-actions">
                    {user ? (
                        <>
                            <Link to="/orders" className="nav-link">
                                Заказы
                            </Link>
                            <div className="user-menu">
                                <span className="user-name">{user.firstName || user.username}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Выйти
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">
                                Войти
                            </Link>
                            <Link to="/register" className="nav-link register-link">
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

