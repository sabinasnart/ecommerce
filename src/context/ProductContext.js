import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 0,
    total: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    order: 'DESC',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = useCallback(async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await productService.getAllProducts(params);
      if (response && response.products) {
        if (append) {
          setProducts((prev) => [...prev, ...response.products]);
        } else {
          setProducts(response.products);
        }
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.pagination,
          }));
        }
      } else {
        if (!append) {
          setProducts([]);
        }
        setError('Неверный формат ответа от сервера');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка загрузки товаров';
      setError(errorMessage);
      if (!append) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const loadMoreProducts = useCallback(async () => {
    if (pagination.page >= pagination.pages || loadingMore) {
      return;
    }
    const nextPage = pagination.page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const params = {
        page: nextPage,
        limit: pagination.limit,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await productService.getAllProducts(params);
      if (response && response.products) {
        setProducts((prev) => [...prev, ...response.products]);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.pagination,
          }));
        }
      }
    } catch (err) {
      console.error('Error loading more products:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка загрузки товаров';
      setError(errorMessage);
    } finally {
      setLoadingMore(false);
    }
  }, [filters, pagination.page, pagination.pages, pagination.limit, loadingMore]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const loadProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProductById(id);
      setCurrentProduct(response.product);
      return { success: true, product: response.product };
    } catch (err) {
      console.error('Error loading product:', err);
      const errorMsg = err.response?.data?.error || 'Товар не найден';
      setError(errorMsg);
      setCurrentProduct(null);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    setProducts([]);
  };

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      order: 'DESC',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const value = {
    products,
    categories,
    currentProduct,
    loading,
    loadingMore,
    error,
    pagination,
    filters,
    loadProducts,
    loadMoreProducts,
    loadProductById,
    loadCategories,
    updateFilters,
    setPage,
    resetFilters,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

