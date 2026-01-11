import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const LOCAL_STORAGE_CART_KEY = 'localCart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateLocalCart = (items) => {
    const newTotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * item.quantity);
    }, 0);
    const newCount = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(parseFloat(newTotal.toFixed(2)));
    setItemsCount(newCount);
  };

  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (localCart) {
        const items = JSON.parse(localCart);
        setCartItems(items);
        calculateLocalCart(items);
      } else {
        setCartItems([]);
        setTotal(0);
        setItemsCount(0);
      }
    } catch (err) {
      console.error('Error loading local cart:', err);
      setCartItems([]);
      setTotal(0);
      setItemsCount(0);
    }
  };

  const saveLocalCart = (items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
      setCartItems(items);
      calculateLocalCart(items);
    } catch (err) {
      console.error('Error saving local cart:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const syncLocalCartToServer = async () => {
        try {
          const localCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART_KEY) || '[]');
          if (localCart.length > 0) {
            for (const item of localCart) {
              try {
                await cartService.addToCart(item.productId, item.quantity);
              } catch (err) {
                console.error('Error syncing cart item:', err);
              }
            }
            localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
          }
          await loadCart();
        } catch (err) {
          console.error('Error syncing cart:', err);
          loadCart();
        }
      };
      syncLocalCartToServer();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      setCartItems(response.cartItems || []);
      setTotal(response.total || 0);
      setItemsCount(response.itemsCount || 0);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, productData = null) => {
    if (!isAuthenticated) {
      if (!productData) {
        return { success: false, error: 'Необходимы данные товара' };
      }
      const localCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART_KEY) || '[]');
      const existingItemIndex = localCart.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity;
      } else {
        localCart.push({
          id: `local_${Date.now()}`,
          productId,
          quantity,
          price: productData.price,
          product: productData
        });
      }
      
      saveLocalCart(localCart);
      return { success: true };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCartItems(response.cartItems || []);
      const newTotal = response.cartItems?.reduce((sum, item) => {
        return sum + (parseFloat(item.product?.price || 0) * item.quantity);
      }, 0) || 0;
      setTotal(parseFloat(newTotal.toFixed(2)));
      setItemsCount(response.cartItems?.length || 0);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка добавления в корзину';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART_KEY) || '[]');
      const itemIndex = localCart.findIndex(item => item.id === cartItemId);
      if (itemIndex >= 0) {
        localCart[itemIndex].quantity = quantity;
        saveLocalCart(localCart);
        return { success: true };
      }
      return { success: false, error: 'Товар не найден' };
    }

    setLoading(true);
    setError(null);
    try {
      await cartService.updateCartItem(cartItemId, quantity);
      await loadCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка обновления корзины';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CART_KEY) || '[]');
      const filteredCart = localCart.filter(item => item.id !== cartItemId);
      saveLocalCart(filteredCart);
      return { success: true };
    }

    setLoading(true);
    setError(null);
    try {
      await cartService.removeFromCart(cartItemId);
      await loadCart();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка удаления из корзины';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      setCartItems([]);
      setTotal(0);
      setItemsCount(0);
      return { success: true };
    }

    setLoading(true);
    setError(null);
    try {
      await cartService.clearCart();
      setCartItems([]);
      setTotal(0);
      setItemsCount(0);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Ошибка очистки корзины';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    total,
    itemsCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

