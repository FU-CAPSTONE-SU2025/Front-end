// Performance Optimization Utilities

// Remove console.log in production
export const debugLog = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization helper for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Virtual scrolling helper
export const getVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );
  
  return {
    startIndex: Math.max(0, startIndex - 5), // Buffer
    endIndex: Math.min(totalItems, endIndex + 5), // Buffer
  };
};

// Performance monitoring
export const measurePerformance = <T extends (...args: any[]) => any>(
  name: string,
  func: T
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`${name} took ${end - start}ms`);
    }
    
    return result;
  }) as T;
};

// Cleanup function for event listeners
export const createCleanup = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    execute: () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      cleanupFunctions.length = 0;
    },
  };
};

// Optimized array operations
export const arrayUtils = {
  // Efficient array filtering with early exit
  filterWithLimit: <T>(
    array: T[],
    predicate: (item: T, index: number) => boolean,
    limit: number
  ): T[] => {
    const result: T[] = [];
    for (let i = 0; i < array.length && result.length < limit; i++) {
      if (predicate(array[i], i)) {
        result.push(array[i]);
      }
    }
    return result;
  },
  
  // Efficient array mapping with memoization
  mapMemoized: <T, R>(
    array: T[],
    mapper: (item: T, index: number) => R,
    getKey?: (item: T) => string
  ): R[] => {
    const cache = new Map<string, R>();
    return array.map((item, index) => {
      const key = getKey ? getKey(item) : `${index}-${JSON.stringify(item)}`;
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = mapper(item, index);
      cache.set(key, result);
      return result;
    });
  },
};

// Memory management
export const memoryUtils = {
  // Clear large objects from memory
  clearLargeObjects: () => {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc?.();
    }
  },
  
  // Monitor memory usage
  getMemoryUsage: () => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};

// Network optimization
export const networkUtils = {
  // Prefetch critical resources
  prefetchResource: (url: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },
  
  // Preload critical resources
  preloadResource: (url: string, as: string = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  },
};

// Animation optimization
export const animationUtils = {
  // Reduce motion for users who prefer it
  shouldReduceMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Optimize animation frame rate
  getOptimalFrameRate: () => {
    const frameRate = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 60;
    return frameRate;
  },
};

export default {
  debugLog,
  debounce,
  throttle,
  memoize,
  createIntersectionObserver,
  getVisibleRange,
  measurePerformance,
  createCleanup,
  arrayUtils,
  memoryUtils,
  networkUtils,
  animationUtils,
}; 