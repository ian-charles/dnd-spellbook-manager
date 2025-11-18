import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangle' | 'circle';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const skeletonClass = `loading-skeleton loading-skeleton-${variant} loading-skeleton-pulse ${className}`.trim();

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const skeleton = <div className={skeletonClass} style={style} />;

  if (count === 1) {
    return skeleton;
  }

  return (
    <div className="loading-skeleton-wrapper">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} style={style} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
