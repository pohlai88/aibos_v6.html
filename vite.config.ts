import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Routing
          'router': ['react-router-dom'],
          
          // Database and auth
          'supabase': ['@supabase/supabase-js'],
          
          // UI libraries
          'ui-vendor': ['@headlessui/react', 'lucide-react', 'framer-motion'],
          
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Data visualization
          'charts': ['d3', '@types/d3', 'react-d3-tree'],
          
          // Utilities
          'utils': ['clsx', 'tailwind-merge', 'fuse.js'],
          
          // PDF and export
          'export': ['html2canvas', 'jspdf', 'papaparse'],
          
          // Date handling
          'dates': ['moment-timezone', 'react-big-calendar'],
          
          // State management
          'state': ['@tanstack/react-query'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
    // Enable HMR optimization
    hmr: {
      overlay: false,
    },
  },
  preview: {
    port: 4173,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@headlessui/react',
      'lucide-react',
      'framer-motion',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'd3',
      'clsx',
      'tailwind-merge',
      'fuse.js',
      'moment-timezone',
      '@tanstack/react-query',
    ],
  },
  // Performance optimizations
  esbuild: {
    target: 'es2020',
    supported: {
      'bigint': true,
    },
  },
}) 