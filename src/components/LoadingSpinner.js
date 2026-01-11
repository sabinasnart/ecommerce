import React from 'react';
import '../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, text = '' }) => {
  const spinnerClasses = `spinner spinner-${size} ${fullScreen ? 'spinner-fullscreen' : ''}`.trim();

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen-wrapper">
        <div className={spinnerClasses}></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className={spinnerClasses}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

