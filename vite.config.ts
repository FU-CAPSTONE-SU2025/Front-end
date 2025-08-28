import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ViteImageOptimizer from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    ViteImageOptimizer({
      // WebP optimization
      webp: {
        quality: 80,
      },
      // JPEG optimization
      mozjpeg: {
        quality: 80,
        progressive: true,
      },
      // PNG optimization
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      // GIF optimization
      gifsicle: {
        optimizationLevel: 3,
        interlaced: false,
      },
      // SVG optimization
      svgo: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                addAttributesToSVGElement: {
                  params: {
                    attributes: [
                      { xmlns: 'http://www.w3.org/2000/svg' }
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: false,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          
          // UI Libraries
          'antd-vendor': ['antd', '@ant-design/icons', '@ant-design/compatible'],
          
          // State Management
          'state-vendor': ['zustand', '@tanstack/react-query'],
          
          // Charting and Data Visualization
          'charts-vendor': ['recharts'],
          
          // Utilities
          'utils-vendor': ['axios', 'dayjs', 'crypto-js', 'jwt-decode'],
          
          // File handling
          'file-vendor': ['xlsx', 'file-saver'],
          
          // Real-time communication
          'realtime-vendor': ['@microsoft/signalr'],
          
          // Animation and UI
          'ui-vendor': ['framer-motion', 'lucide-react'],
          
          // Authentication
          'auth-vendor': ['@react-oauth/google', 'react-turnstile'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo?.name;
          if (!name) {
            return 'assets/[name]-[hash][extname]';
          }
          
          const info = name.split('.');
          if (info.length < 2) {
            return 'assets/[name]-[hash][extname]';
          }
          
          const ext = info[info.length - 1].toLowerCase();
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return 'images/[name]-[hash][extname]';
          }
          if (/css/i.test(ext)) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'zustand',
      '@tanstack/react-query',
      'axios',
      'dayjs'
    ],
    exclude: [
      'xlsx', // Exclude heavy libraries from pre-bundling
      '@microsoft/signalr'
    ]
  },
})
