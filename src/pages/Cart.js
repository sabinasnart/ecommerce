import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, total, loading, error, updateCartItem, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = async (cartItemId, currentQuantity, delta) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    await updateCartItem(cartItemId, newQuantity);
  };

  const handleRemove = async (cartItemId) => {
    if (window.confirm('Удалить товар из корзины?')) {
      await removeFromCart(cartItemId);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/orders');
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Корзина</h1>
          <div className="cart-empty">
            <p>Ваша корзина пуста</p>
            <Link to="/products">
              <Button variant="primary">Перейти в каталог</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Корзина</h1>
          <button className="clear-cart-button" onClick={clearCart}>
            Очистить корзину
          </button>
        </div>

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = item.product || item;
              const price = parseFloat(product?.price || item.price || 0);
              const itemTotal = price * item.quantity;
              const imageUrl = (product?.image && product.image.length > 0)
                ? product.image[0]
                : (item.image && item.image.length > 0)
                ? item.image[0]
                : '/placeholder-product.jpg';

              return (
                <div key={item.id} className="cart-item">
                  <Link to={`/products/${product?.id || item.productId}`} className="cart-item-image-link">
                    <ProductImage
                      src={imageUrl}
                      alt={product?.name || 'Товар'}
                      className="cart-item-image"
                    />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${product?.id || item.productId}`} className="cart-item-name">
                      {product?.name || 'Товар'}
                    </Link>
                    {product?.category && (
                      <div className="cart-item-category">{product.category.name}</div>
                    )}
                    <div className="cart-item-price">
                      {price.toFixed(2)} ₽
                    </div>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="quantity-button"
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1 || loading}
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-button"
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      disabled={loading}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-item-total">
                    {itemTotal.toFixed(2)} ₽
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item.id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-content">
              <div className="cart-summary-row">
                <span className="summary-label">Товаров:</span>
                <span className="summary-value">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.
                </span>
              </div>
              <div className="cart-summary-row total">
                <span className="summary-label">Итого:</span>
                <span className="summary-value">{total.toFixed(2)} ₽</span>
              </div>
              <Button
                variant="primary"
                size="large"
                onClick={handleCheckout}
                disabled={loading}
                className="checkout-button"
              >
                {isAuthenticated ? 'Оформить заказ' : 'Войти для оформления заказа'}
              </Button>
              {!isAuthenticated && (
                <div className="checkout-hint">
                  <p>Для оформления заказа необходимо войти в систему</p>
                  <Link to="/register" className="register-hint-link">
                    Нет аккаунта? Зарегистрируйтесь
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
