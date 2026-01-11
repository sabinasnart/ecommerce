import React, { useState, useEffect } from 'react';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import '../styles/pages/Products.css';

const Products = () => {
  const { products, categories, loading, error, filters, updateFilters, resetFilters, pagination, setPage } = useProduct();
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

  useEffect(() => {
    setSelectedCategory(filters.category || '');
  }, [filters.category]);

  const handleCategoryChange = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId;
    setSelectedCategory(newCategory);
    updateFilters({ category: newCategory });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    resetFilters();
  };

  const hasActiveFilters = selectedCategory || filters.search;

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <div>
            <h1 className="page-title">Каталог</h1>
            {!loading && pagination.total > 0 && (
              <div className="products-count">
                Найдено товаров: {pagination.total}
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="small"
              onClick={handleResetFilters}
              className="reset-filters-btn"
            >
              Сбросить фильтры
            </Button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="categories-filter">
            <div className="filter-label">Категории:</div>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`filter-button ${selectedCategory === String(category.id) ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && products.length === 0 && <LoadingSpinner />}

        {error && products.length === 0 && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="no-products">
            <p>Товары не найдены</p>
          </div>
        )}

        {products.length > 0 && (
          <>
            {loading && (
              <div className="products-loading-overlay">
                <LoadingSpinner />
              </div>
            )}
            <div className={`products-grid ${loading ? 'loading' : ''}`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Назад
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 7) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 4) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 3) {
                      pageNum = pagination.pages - 6 + i;
                    } else {
                      pageNum = pagination.page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-page ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="pagination-button"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

