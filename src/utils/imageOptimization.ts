// Image optimization utilities
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  lazy?: boolean;
  priority?: boolean;
}

// WebP support detection
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const dataURL = canvas.toDataURL('image/webp');
      resolve(dataURL.indexOf('data:image/webp') === 0);
    } else {
      resolve(false);
    }
  });
};

// Generate responsive image URLs
export const generateResponsiveImageUrls = (
  originalSrc: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
): string[] => {
  if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
    return [originalSrc];
  }

  return breakpoints.map(bp => {
    // For now, return the original src for all breakpoints
    // In a real implementation, you'd generate different sized images
    return originalSrc;
  });
};

// Generate srcset string
export const generateSrcSet = (
  originalSrc: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
    return originalSrc;
  }

  const urls = generateResponsiveImageUrls(originalSrc, breakpoints);
  return urls.map((url, index) => `${url} ${breakpoints[index]}w`).join(', ');
};

// Convert image to WebP format
export const convertToWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to WebP'));
            }
          },
          'image/webp',
          0.8
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Compress image
export const compressImage = async (
  file: File,
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Resize if max dimensions are specified
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (srcs: string[]): Promise<void> => {
  const promises = srcs.map(src => preloadImage(src));
  await Promise.all(promises);
};

// Generate placeholder image
export const generatePlaceholder = (
  width: number = 200,
  height: number = 200,
  text: string = 'Loading...'
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
  }

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#999';
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toDataURL();
};

// Generate error placeholder
export const generateErrorPlaceholder = (
  width: number = 200,
  height: number = 200
): string => {
  return generatePlaceholder(width, height, 'Image not found');
};

// Calculate optimal image size based on container
export const calculateOptimalImageSize = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): { width: number; height: number } => {
  const aspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let width, height;

  if (aspectRatio > containerAspectRatio) {
    // Image is wider than container
    width = containerWidth;
    height = containerWidth / aspectRatio;
  } else {
    // Image is taller than container
    height = containerHeight;
    width = containerHeight * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

// Debounced image loading
export const debouncedImageLoad = (
  callback: () => void,
  delay: number = 100
): (() => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Image loading performance monitoring
export const monitorImageLoad = (
  src: string,
  onLoad?: (duration: number) => void,
  onError?: (error: string) => void
): void => {
  const startTime = performance.now();
  const img = new Image();

  img.onload = () => {
    const duration = performance.now() - startTime;
    onLoad?.(duration);
  };

  img.onerror = () => {
    const duration = performance.now() - startTime;
    onError?.(`Failed to load image: ${src} (${duration.toFixed(2)}ms)`);
  };

  img.src = src;
};

// Batch image optimization
export const optimizeImageBatch = async (
  files: File[],
  config: ImageOptimizationConfig = {}
): Promise<Blob[]> => {
  const optimizedFiles: Blob[] = [];

  for (const file of files) {
    try {
      let optimizedFile: Blob = file;

      // Compress if quality is specified
      if (config.quality && config.quality < 1) {
        optimizedFile = await compressImage(
          optimizedFile,
          config.quality,
          config.width,
          config.height
        );
      }

      // Convert to WebP if supported and requested
      if (config.format === 'webp' || (config.format === 'auto' && await supportsWebP())) {
        optimizedFile = await convertToWebP(optimizedFile);
      }

      optimizedFiles.push(optimizedFile);
    } catch (error) {
      console.warn(`Failed to optimize image: ${file.name}`, error);
      optimizedFiles.push(file); // Use original if optimization fails
    }
  }

  return optimizedFiles;
};

export default {
  supportsWebP,
  generateResponsiveImageUrls,
  generateSrcSet,
  convertToWebP,
  compressImage,
  preloadImage,
  preloadImages,
  generatePlaceholder,
  generateErrorPlaceholder,
  calculateOptimalImageSize,
  debouncedImageLoad,
  monitorImageLoad,
  optimizeImageBatch,
};
