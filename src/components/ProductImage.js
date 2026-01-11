import React from 'react';

const ProductImage = ({ 
  src, 
  alt, 
  className = '', 
  avifSrc = null,
  webpSrc = null,
  fallbackSrc = null,
  onError = null
}) => {
  const imageUrl = src || '/placeholder-product.jpg';
  const avif = avifSrc || (imageUrl.endsWith('.avif') ? imageUrl : null);
  const webp = webpSrc || (imageUrl.endsWith('.webp') ? imageUrl : null);
  const fallback = fallbackSrc || imageUrl;

  const handleError = (e) => {
    if (onError) {
      onError(e);
    } else {
      e.target.src = '/placeholder-product.jpg';
    }
  };

  if (avif || webp) {
    return (
      <picture className={className}>
        {avif && <source srcSet={avif} type="image/avif" />}
        {webp && <source srcSet={webp} type="image/webp" />}
        <img 
          src={fallback} 
          alt={alt}
          className={className}
          onError={handleError}
        />
      </picture>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ProductImage;

