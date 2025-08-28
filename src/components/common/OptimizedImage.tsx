import React, { useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  fallback?: string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=',
  lazy = true,
  priority = false,
  sizes = '100vw',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate WebP src if supported
  const generateWebPSrc = (originalSrc: string): string => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const dataURL = canvas.toDataURL('image/webp');
      const supportsWebP = dataURL.indexOf('data:image/webp') === 0;
      
      if (supportsWebP && !originalSrc.includes('.webp')) {
        // For external images, we can't convert to WebP
        if (originalSrc.startsWith('http')) return originalSrc;
        
        // For local images, we can try to use WebP version
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return webpSrc;
      }
    }
    
    return originalSrc;
  };

  // Generate responsive srcset
  const generateSrcSet = (originalSrc: string): string => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    const srcSet = breakpoints
      .map(bp => {
        const webpSrc = generateWebPSrc(originalSrc);
        return `${webpSrc} ${bp}w`;
      })
      .join(', ');

    return srcSet;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const loadImage = () => {
      setIsLoading(true);
      setHasError(false);

      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        onLoad?.();
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        setHasError(true);
        setIsLoading(false);
        setImageSrc(fallback);
        onError?.();
      };

      img.src = src;
    };

    loadImage();
  }, [src, isInView, fallback, onLoad, onError]);

  // Generate optimized src and srcset
  const optimizedSrc = generateWebPSrc(src);
  const srcSet = generateSrcSet(src);

  return (
    <div 
      className={`optimized-image-container ${className}`}
      style={{ 
        position: 'relative',
        width: width || 'auto',
        height: height || 'auto',
        ...style 
      }}
    >
      {isLoading && (
        <div 
          className="image-loading-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1,
          }}
        >
          <Spin size="small" />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`optimized-image ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
        sizes={sizes}
        srcSet={srcSet}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          setImageSrc(fallback);
          onError?.();
        }}
      />
    </div>
  );
};

export default OptimizedImage;
