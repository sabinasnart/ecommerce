import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, error, loadProductById } = useProduct();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCartMessage, setAddToCartMessage] = useState(null);

  useEffect(() => {
    if (id) {
      setSelectedVolume(null);
      setQuantity(1);
      setAddToCartMessage(null);
      loadProductById(id);
    }
  }, [id, loadProductById]);

  useEffect(() => {
    if (currentProduct && currentProduct.volumes) {
      const volumes = Object.keys(currentProduct.volumes);
      if (volumes.length > 0 && !selectedVolume) {
        setSelectedVolume(volumes[0]);
      }
    }
  }, [currentProduct, selectedVolume]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="product-error">
            <p>{error || 'Товар не найден'}</p>
            <Button variant="secondary" onClick={() => navigate('/products')}>
              Вернуться в каталог
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const volumes = currentProduct.volumes || {};
  const volumeKeys = Object.keys(volumes).sort((a, b) => parseInt(a) - parseInt(b));
  const hasVolumes = volumeKeys.length > 0;

  const getCurrentPrice = () => {
    if (hasVolumes && selectedVolume && volumes[selectedVolume]) {
      return parseFloat(volumes[selectedVolume]);
    }
    return parseFloat(currentProduct.price || 0);
  };

  const currentPrice = getCurrentPrice();
  const comparePrice = currentProduct.comparePrice ? parseFloat(currentProduct.comparePrice) : null;
  const hasDiscount = comparePrice && comparePrice > currentPrice;

  const handleAddToCart = async () => {
    if (!currentProduct.stock || currentProduct.stock === 0) {
      setAddToCartMessage('Товар отсутствует на складе');
      return;
    }

    const productData = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentPrice,
      image: currentProduct.image,
      category: currentProduct.category
    };

    const result = await addToCart(currentProduct.id, quantity, productData);
    if (result.success) {
      setAddToCartMessage('success');
      setTimeout(() => setAddToCartMessage(null), 5000);
    } else {
      setAddToCartMessage(result.error || 'Ошибка добавления в корзину');
      setTimeout(() => setAddToCartMessage(null), 3000);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, currentProduct.stock || 1));
    setQuantity(newQuantity);
  };

  const imageUrl = currentProduct.image && currentProduct.image.length > 0
    ? currentProduct.image[0]
    : '/placeholder-product.jpg';

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail">
          <div className="product-detail-image-section">
            <div className="product-detail-image-wrapper">
              {hasDiscount && (
                <span className="product-detail-badge">Скидка</span>
              )}
              <ProductImage
                src={imageUrl}
                alt={currentProduct.name}
                className="product-detail-image"
              />
            </div>
          </div>

          <div className="product-detail-info">
            <div className="product-detail-header">
              {currentProduct.category && (
                <div className="product-detail-category">
                  {currentProduct.category.name}
                </div>
              )}
              <h1 className="product-detail-title">{currentProduct.name}</h1>
              {currentProduct.sku && (
                <div className="product-detail-sku">Артикул: {currentProduct.sku}</div>
              )}
            </div>

            {currentProduct.description && (
              <div className="product-detail-description">
                <p>{currentProduct.description}</p>
              </div>
            )}

            {hasVolumes && (
              <div className="product-detail-volumes">
                <div className="volumes-label">Объем:</div>
                <div className="volumes-buttons">
                  {volumeKeys.map((vol) => (
                    <button
                      key={vol}
                      className={`volume-button ${selectedVolume === vol ? 'active' : ''}`}
                      onClick={() => setSelectedVolume(vol)}
                    >
                      {vol} мл
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-price-section">
              <div className="product-detail-price">
                {hasDiscount && (
                  <span className="product-detail-price-old">
                    {comparePrice.toFixed(2)} ₽
                  </span>
                )}
                <span className="product-detail-price-current">
                  {currentPrice.toFixed(2)} ₽
                </span>
              </div>
              {quantity > 1 && (
                <div className="product-detail-total">
                  <span className="total-label">Сумма:</span>
                  <span className="total-value">{(currentPrice * quantity).toFixed(2)} ₽</span>
                </div>
              )}
              {currentProduct.stock !== undefined && (
                <div className={`product-detail-stock ${currentProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {currentProduct.stock > 0 
                    ? `В наличии: ${currentProduct.stock} шт.` 
                    : 'Нет в наличии'}
                </div>
              )}
            </div>

            {currentProduct.stock > 0 && (
              <div className="product-detail-actions">
                <div className="quantity-selector">
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentProduct.stock}
                  >
                    +
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  loading={cartLoading}
                  className="add-to-cart-button"
                >
                  Добавить в корзину
                </Button>
              </div>
            )}

            {addToCartMessage && (
              <div className={`add-to-cart-message ${addToCartMessage === 'success' ? 'success' : 'error'}`}>
                {addToCartMessage === 'success' ? (
                  <div className="add-to-cart-success">
                    <p>Товар добавлен в корзину</p>
                    <Button
                      variant="primary"
                      size="medium"
                      onClick={() => navigate('/cart')}
                      className="go-to-cart-button"
                    >
                      Перейти в корзину
                    </Button>
                  </div>
                ) : (
                  <p>{addToCartMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

