import { useState } from 'react';

export default function SafeImage({ src, alt, className }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      {/* Skeleton Loader Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}
      
      <img
        src={src}
        alt={alt}
        loading="lazy" // Native browser lazy loading
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-full object-cover transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  );
}