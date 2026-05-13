import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        // Enable React Fast Refresh
        fastRefresh: true,
        // Optimize JSX runtime
        jsxRuntime: 'automatic',
      }),
    ],
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/components': resolve(__dirname, './src/components'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/hooks': resolve(__dirname, './src/hooks'),
        '@/utils': resolve(__dirname, './src/utils'),
        '@/services': resolve(__dirname, './src/services'),
        '@/types': resolve(__dirname, './src/types'),
      },
    },
    
    // Environment variables validation
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    
    // Build optimizations
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'terser',
      target: 'es2020',
      
      // Terser options for better compression
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      
      // Rollup options for code splitting and optimization
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom'],
            
            // UI library
            'chakra-ui': [
              '@chakra-ui/react',
              '@emotion/react', 
              '@emotion/styled',
              'framer-motion'
            ],
            
            // Routing
            'router': ['react-router-dom'],
            
            // Data fetching
            'query': ['@tanstack/react-query'],
            
            // Icons
            'icons': ['react-icons', '@chakra-ui/icons'],
            
            // Utilities
            'utils': ['axios', 'zustand'],
          },
          
          // Asset file naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '')
              : 'chunk'
            return `assets/js/[name]-[hash].js`
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext || '')) {
              return `assets/css/[name]-[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
        },
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    
    // Optimization options
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
        'react-router-dom',
        '@tanstack/react-query',
      ],
    },
    
    // Preview server configuration
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
  }
})