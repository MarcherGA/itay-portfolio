// vite.config.ts
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    glsl(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js (the largest library) into its own chunk
          'three-core': ['three'],
          
          // React Three Fiber ecosystem
          'react-three': [
            '@react-three/fiber',
            '@react-three/drei'
          ],
          
          // Post-processing effects (heavy shaders)
          'postprocessing': [
            '@react-three/postprocessing'
          ],
          
          // React core and related libraries
          'react-vendor': [
            'react',
            'react-dom',
            'react/jsx-runtime'
          ],
          
          // Zustand for state management
          'state': ['zustand']
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally splitting
    chunkSizeWarningLimit: 1000,
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  }
});
