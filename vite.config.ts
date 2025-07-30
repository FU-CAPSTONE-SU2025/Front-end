import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        // Enhanced manual chunk splitting for better caching
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-core';
          }
          
          // Ant Design and icons
          if (id.includes('antd') || id.includes('@ant-design/icons')) {
            return 'antd-ui';
          }
          
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          
          // Chart libraries
          if (id.includes('recharts') || id.includes('d3')) {
            return 'charts';
          }
          
          // SignalR and real-time communication
          if (id.includes('@microsoft/signalr') || id.includes('signalr')) {
            return 'realtime';
          }
          
          // Query and state management
          if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
            return 'state-management';
          }
          
          // Utility libraries
          if (id.includes('dayjs') || id.includes('xlsx') || id.includes('jwt-decode') || id.includes('axios')) {
            return 'utils';
          }
          
          // Admin pages (heavy components)
          if (id.includes('/admin/') || id.includes('/pages/admin/')) {
            return 'admin-pages';
          }
          
          // Student pages
          if (id.includes('/student/') || id.includes('/pages/student/')) {
            return 'student-pages';
          }
          
          // Advisor pages
          if (id.includes('/advisor/') || id.includes('/pages/advisor/')) {
            return 'advisor-pages';
          }
          
          // Vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 800, // Reduce from 1000kb to 800kb
    // Enable source maps for debugging (disable in production)
    sourcemap: false,
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove console functions
        passes: 2, // Multiple compression passes
      },
      mangle: {
        toplevel: true, // Mangle top-level names
      },
    },
    // Enable tree shaking
    target: 'es2015',
  },
  // Optimize development server
  server: {
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
  },
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'framer-motion',
      'recharts',
      'dayjs',
      'xlsx',
      'jwt-decode',
      '@microsoft/signalr',
      '@tanstack/react-query',
      'zustand',
      'axios',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
      'framer-motion/dist/framer-motion',
    ],
    // Force pre-bundling of dependencies
    force: true,
  },
  // Define environment variables
  define: {
    // Remove console.log in production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Optimize React
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
