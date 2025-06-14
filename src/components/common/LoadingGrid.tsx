
import React from 'react';
import SkeletonCard from './SkeletonCard';

interface LoadingGridProps {
  count?: number;
  variant?: 'client' | 'idea' | 'default';
  className?: string;
}

const LoadingGrid: React.FC<LoadingGridProps> = ({ 
  count = 6, 
  variant = 'default',
  className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          variant={variant}
          className="animate-pulse" 
        />
      ))}
    </div>
  );
};

export default LoadingGrid;
