import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  inline?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  inline = false,
  className = '',
}) => {
  const wrapperClass = `loading-spinner-wrapper ${
    inline ? 'loading-spinner-inline' : 'loading-spinner-center'
  } ${className}`.trim();

  return (
    <div className={wrapperClass}>
      <div
        className={`loading-spinner loading-spinner-${size}`}
        role="status"
        aria-label="Loading"
      >
        <div className="loading-spinner-circle"></div>
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
