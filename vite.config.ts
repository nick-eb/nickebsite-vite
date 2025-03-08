import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'path';

export default defineConfig({
  base: '/',  // Change from '/nickebsite-vite/' to '/'
  plugins: [
    react(),
    mdx()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  assetsInclude: ['**/*.md', '**/*.mdx'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
});
