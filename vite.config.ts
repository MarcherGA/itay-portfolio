// vite.config.ts
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [react(), glsl(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          
          // Three.js core
          'three-core': ['three'],
          
          // React Three Fiber ecosystem
          'r3f-ecosystem': [
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing'
          ],
          
          // Animation libraries
          'animation': ['gsap', '@react-spring/three'],
          
          // Other vendors
          'other-vendor': ['react-youtube']
        }
      }
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000
  }
});
