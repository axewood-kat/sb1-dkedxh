import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf': ['pdfjs-dist']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});