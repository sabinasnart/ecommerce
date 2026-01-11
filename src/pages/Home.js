import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import '../styles/pages/Home.css';

const Home = () => {
  const { products, loading, error, loadProducts, resetFilters } = useProduct();

  useEffect(() => {
    resetFilters();
  }, [resetFilters]);

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Добро пожаловать в MY PARFUM</h1>
          <p>Откройте для себя ароматы от ведущих мировых брендов</p>
        </div>
      </section>

      <section className="products-section">
        <div className="products-container">
          <div className="products-header">
            <h2 className="section-title">Популярные товары</h2>
          </div>

          {loading && <LoadingSpinner />}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!loading && !error && featuredProducts.length > 0 && (
            <>
              <div className="products-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="catalog-link-wrapper">
                <Link to="/products" className="catalog-link">
                  <Button variant="primary" size="medium">
                    Перейти в каталог
                  </Button>
                </Link>
              </div>
            </>
          )}

          {!loading && !error && featuredProducts.length === 0 && (
            <div className="no-products">
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature">
            <div className="feature-icon">01</div>
            <h3>Быстрая доставка</h3>
            <p>Доставка по всей России</p>
          </div>
          <div className="feature">
            <div className="feature-icon">02</div>
            <h3>Гарантия качества</h3>
            <p>Только оригинальная продукция</p>
          </div>
          <div className="feature">
            <div className="feature-icon">03</div>
            <h3>Удобная оплата</h3>
            <p>Безналичный расчет через СБП</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

