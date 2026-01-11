import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Button from './Button';
import ProductImage from './ProductImage';
import '../styles/components/ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, loading: cartLoading } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productData = {
      id: product.id,
      name: product.name,
      price: price,
      image: product.image,
      category: product.category
    };
    
    await addToCart(product.id, 1, productData);
  };

  const getImageSources = () => {
    if (!product.image || product.image.length === 0) {
      return { src: '/placeholder-product.jpg' };
    }

    const firstImage = product.image[0];
    
    if (typeof firstImage === 'object' && firstImage !== null) {
      return {
        avifSrc: firstImage.avif || null,
        webpSrc: firstImage.webp || null,
        fallbackSrc: firstImage.jpg || firstImage.png || firstImage.src || '/placeholder-product.jpg'
      };
    }

    if (typeof firstImage === 'string') {
      const baseUrl = firstImage.replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
      return {
        avifSrc: `${baseUrl}.avif`,
        webpSrc: `${baseUrl}.webp`,
        fallbackSrc: firstImage
      };
    }

    return { src: '/placeholder-product.jpg' };
  };

  const imageSources = getImageSources();
  const price = parseFloat(product.price || 0);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image-wrapper">
          {hasDiscount && (
            <span className="product-card-badge">Скидка</span>
          )}
          <ProductImage 
            src={imageSources.src}
            avifSrc={imageSources.avifSrc}
            webpSrc={imageSources.webpSrc}
            fallbackSrc={imageSources.fallbackSrc}
            alt={product.name}
            className="product-card-image"
          />
        </div>
        <div className="product-card-content">
          <h3 className="product-card-title">{product.name}</h3>
          {product.category && (
            <p className="product-card-category">{product.category.name}</p>
          )}
          <div className="product-card-price">
            {hasDiscount && (
              <span className="product-card-price-old">{comparePrice.toFixed(2)} ₽</span>
            )}
            <span className="product-card-price-current">{price.toFixed(2)} ₽</span>
          </div>
          {product.stock !== undefined && (
            <p className={`product-card-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
            </p>
          )}
        </div>
      </Link>
      <div className="product-card-actions">
        <Button
          variant="primary"
          size="medium"
          onClick={handleAddToCart}
          disabled={!product.stock || product.stock === 0 || cartLoading}
          loading={cartLoading}
          className="product-card-button"
        >
          {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;

